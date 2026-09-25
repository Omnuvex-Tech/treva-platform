import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  BITRIX_PAGE_SIZE,
  BitrixClient,
  BitrixError,
  type BitrixFieldInfo,
  type BitrixStatus,
} from './bitrix.client';

/** "P" in progress, "S" won, "F" lost — Bitrix's stage semantics. */
type Semantics = 'P' | 'S' | 'F';

interface StageInfo {
  name: string;
  semantics: Semantics;
}

/** Deal stages and field lists barely change; re-read them this often. */
const CACHE_MS = 10 * 60_000;

/** How many unchecked clients one read of the list may send to Bitrix. */
const MAX_PUSHES_PER_REFRESH = 5;

/** After a failed attempt, a read waits this long before trying again. */
const RETRY_AFTER_MS = 60_000;

const brokerProfile = {
  id: true,
  role: true,
  fullName: true,
  email: true,
  phones: true,
  bitrixContactId: true,
  company: { select: { name: true } },
} satisfies Prisma.UserSelect;

type BrokerProfile = Prisma.UserGetPayload<{ select: typeof brokerProfile }>;

const withBrokerProfile = {
  broker: { select: brokerProfile },
} satisfies Prisma.ClientInclude;

type ClientForBitrix = Prisma.ClientGetPayload<{
  include: typeof withBrokerProfile;
}>;

function semanticsOf(status: BitrixStatus): Semantics {
  const raw = (status.EXTRA?.SEMANTICS ?? status.SEMANTICS ?? '')
    .toString()
    .trim()
    .toUpperCase();
  if (raw.startsWith('S')) return 'S';
  // "apology" is Bitrix's name for a secondary failure stage.
  if (raw.startsWith('F') || raw.startsWith('A')) return 'F';
  return 'P';
}

/** Used only when crm.status.list cannot be read. */
function fallbackSemantics(stageId: string): Semantics {
  if (stageId.endsWith('WON')) return 'S';
  if (stageId.endsWith('LOSE')) return 'F';
  return 'P';
}

/** "Panorama by ELIE SAAB" and "Panorama by Elie Saab" are the same project. */
function normalizeName(value: string) {
  return value.toLocaleLowerCase('en').replace(/[^\p{L}\p{N}]+/gu, '');
}

function parseNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function errorMessage(error: unknown) {
  if (error instanceof BitrixError) return error.message;
  if (error instanceof Error) return error.message;
  return String(error);
}

/**
 * The spellings one phone number is commonly stored under in Bitrix, so a
 * client typed as "050 311 44 21" still matches a contact saved as
 * "+994503114421". Azerbaijani numbers get their +994 / 994 / 0 / bare forms;
 * anything else is searched as typed and as digits.
 */
export function phoneVariants(phone: string): string[] {
  const variants = new Set<string>();
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return [];

  variants.add(trimmed);
  variants.add(digits);
  variants.add(`+${digits}`);

  let local: string | null = null;
  if (digits.startsWith('994') && digits.length === 12) local = digits.slice(3);
  else if (digits.startsWith('0') && digits.length === 10)
    local = digits.slice(1);
  else if (digits.length === 9) local = digits;

  if (local) {
    for (const form of [`+994${local}`, `994${local}`, `0${local}`, local]) {
      variants.add(form);
    }
  }

  return [...variants];
}

/**
 * Registers broker-panel clients in Bitrix24 and keeps the outcome in view.
 *
 * On registration (`push`) the client is looked up among Bitrix's contacts by
 * phone number (the email only when there is none):
 *
 *  - a match means Bitrix already knows the client — no deal is created, and
 *    the client is marked `already_in_bitrix`;
 *  - otherwise a contact is created and a deal opened for it in the
 *    "Сделки от агентов" stage, and the client is marked `deal_created`.
 *
 * The deal names the broker the way Bitrix's own Agent Cabinet deals do: the
 * broker's contact card in "Агент (CRM)" and their agency's company as the
 * deal's company. That link is also what lets the stage's workflow (bp-327)
 * pick Leyla or Nigar.
 *
 * Brokers are put in Bitrix as soon as their account exists (`syncBroker`,
 * called on sign-up, on an admin creating them or their agency, and on
 * sign-in for accounts made before this) — not only when a first deal needs
 * them.
 *
 * After that, `refresh` re-reads the deal's stage whenever someone looks at the
 * client, so the panel shows how the deal is moving.
 *
 * Nothing here throws into a request: Bitrix being down leaves a client
 * `pending` and `failed`, and a later read tries again.
 */
@Injectable()
export class BitrixSyncService {
  private readonly logger = new Logger(BitrixSyncService.name);

  private readonly categoryId: string;
  private readonly stageId: string;
  private readonly sourceId: string;
  private readonly responsibleIds: number[];
  private readonly refreshAfterMs: number;
  private readonly brokerContactType: string;
  private readonly fields: {
    agent: string;
    agentCrm: string;
    agency: string;
    fromAgent: string;
    objectOfInterest: string;
    project: string;
    panelClientId: string;
  };

  /** Clients being sent right now, so two reads cannot create two deals. */
  private readonly pushing = new Set<string>();
  private stageCache: { stages: Map<string, StageInfo>; at: number } | null =
    null;
  private fieldCache: {
    fields: Record<string, BitrixFieldInfo>;
    at: number;
  } | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly bitrix: BitrixClient,
    config: ConfigService,
  ) {
    const env = (key: string) => config.get<string>(key)?.trim() ?? '';

    this.categoryId = env('BITRIX_DEAL_CATEGORY_ID') || '0';
    this.stageId = env('BITRIX_DEAL_STAGE_ID');
    this.sourceId = env('BITRIX_SOURCE_ID');
    this.responsibleIds = env('BITRIX_DEAL_RESPONSIBLE_IDS')
      .split(',')
      .map((id) => Number(id.trim()))
      .filter((id) => Number.isInteger(id) && id > 0);
    this.refreshAfterMs = (Number(env('BITRIX_REFRESH_SECONDS')) || 60) * 1000;
    this.brokerContactType = env('BITRIX_BROKER_CONTACT_TYPE');
    this.fields = {
      agent: env('BITRIX_DEAL_FIELD_AGENT'),
      agentCrm: env('BITRIX_DEAL_FIELD_AGENT_CRM'),
      agency: env('BITRIX_DEAL_FIELD_AGENCY'),
      fromAgent: env('BITRIX_DEAL_FIELD_FROM_AGENT'),
      objectOfInterest: env('BITRIX_DEAL_FIELD_OBJECT_OF_INTEREST'),
      project: env('BITRIX_DEAL_FIELD_PROJECT'),
      panelClientId: env('BITRIX_DEAL_FIELD_PANEL_CLIENT_ID'),
    };

    if (!bitrix.enabled) {
      this.logger.warn(
        'BITRIX_WEBHOOK_URL is not set — clients will not be sent to Bitrix24',
      );
    }
  }

  // ─── Brokers: account → Bitrix contact ────────────────────────────────

  /**
   * Makes sure a broker's account has its Bitrix contact (and their agency its
   * company). Never throws, so it can run alongside sign-up or sign-in without
   * holding them up; a broker it could not sync is tried again on their next
   * sign-in or first deal. Admins are not brokers and are skipped.
   */
  async syncBroker(userId: string): Promise<void> {
    if (!this.bitrix.enabled) return;

    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: brokerProfile,
      });
      if (!user || user.role === 'admin' || user.bitrixContactId !== null) {
        return;
      }
      await this.brokerLink(user);
    } catch (error) {
      this.logger.warn(`Broker ${userId} → Bitrix24: ${errorMessage(error)}`);
    }
  }

  // ─── Registration: panel → Bitrix ─────────────────────────────────────

  /**
   * Checks the client against Bitrix and, if Bitrix does not know them,
   * creates the contact and the deal. Does nothing for a client whose outcome
   * is already known.
   */
  async push(clientId: string): Promise<void> {
    if (!this.bitrix.enabled || this.pushing.has(clientId)) return;
    this.pushing.add(clientId);

    try {
      const client = await this.prisma.client.findUnique({
        where: { id: clientId },
        include: withBrokerProfile,
      });
      if (!client || client.status !== 'pending') return;

      // A contact id on a pending client is one this platform created on an
      // attempt whose deal then failed — reuse it rather than check again,
      // or the client would match their own new contact.
      let contactId = client.bitrixContactId;

      if (contactId === null) {
        const existing = await this.findExistingContact(client);
        if (existing !== null) {
          await this.markSynced(client.id, {
            status: 'already_in_bitrix',
            bitrixContactId: existing,
          });
          return;
        }

        contactId = await this.bitrix.addContact(this.contactFields(client));
        await this.prisma.client.update({
          where: { id: client.id },
          data: { bitrixContactId: contactId },
        });
      }

      const broker = await this.brokerLink(client.broker);
      const assignedById = await this.nextResponsible();
      const fields = await this.dealFields(
        client,
        contactId,
        broker,
        assignedById,
      );
      const dealId = await this.bitrix.addDeal(fields);
      const stage = this.stageId
        ? await this.stageInfo(this.stageId)
        : undefined;

      await this.markSynced(client.id, {
        status: 'deal_created',
        bitrixDealId: dealId,
        bitrixAssignedById: assignedById,
        bitrixDealTitle: String(fields.TITLE),
        bitrixDealStage: stage?.name ?? null,
        bitrixDealStageSemantics: stage?.semantics ?? 'P',
      });
    } catch (error) {
      this.logger.warn(`Client ${clientId} → Bitrix24: ${errorMessage(error)}`);
      await this.prisma.client
        .update({
          where: { id: clientId },
          data: {
            bitrixSyncState: 'failed',
            bitrixSyncError: errorMessage(error).slice(0, 500),
            bitrixSyncedAt: new Date(),
          },
        })
        .catch(() => undefined);
    } finally {
      this.pushing.delete(clientId);
    }
  }

  private markSynced(
    id: string,
    extra: Prisma.ClientUpdateInput = {},
  ): Promise<unknown> {
    return this.prisma.client.update({
      where: { id },
      data: {
        ...extra,
        bitrixSyncState: 'synced',
        bitrixSyncError: null,
        bitrixSyncedAt: new Date(),
      },
    });
  }

  /**
   * The broker's own contact in Bitrix and their agency's company. The contact
   * id saved on the account is used when there is one; otherwise the broker is
   * looked up by phone (email only for an account without one), and created
   * when missing — a contact of
   * type "Агенты" under the agency — and the id saved. An existing contact is
   * used as it is, never edited.
   */
  private async brokerLink(
    broker: BrokerProfile,
  ): Promise<{ contactId: number; companyId: number | null }> {
    const agency = broker.company?.name?.trim() ?? '';
    const companyId = agency ? await this.resolveCompany(agency) : null;

    if (broker.bitrixContactId !== null) {
      return { contactId: broker.bitrixContactId, companyId };
    }

    const contactId = await this.findOrCreateBrokerContact(broker, companyId);
    await this.prisma.user.update({
      where: { id: broker.id },
      data: { bitrixContactId: contactId },
    });
    return { contactId, companyId };
  }

  private async findOrCreateBrokerContact(
    broker: BrokerProfile,
    companyId: number | null,
  ): Promise<number> {
    // The phone is the broker's required identifier, so it decides; the email
    // only matters for an account without a number (self sign-up asks none).
    const phones = [...new Set(broker.phones.flatMap(phoneVariants))];
    const byPhone = phones.length
      ? await this.bitrix.findContacts('PHONE', phones)
      : [];
    const found =
      byPhone.length || !broker.email
        ? byPhone
        : await this.bitrix.findContacts('EMAIL', [broker.email]);
    if (found.length) return Math.min(...found);

    const [firstName, ...rest] = broker.fullName.trim().split(/\s+/);
    const fields: Record<string, unknown> = {
      NAME: firstName ?? broker.fullName,
      LAST_NAME: rest.join(' '),
      PHONE: broker.phones
        .filter(Boolean)
        .map((value) => ({ VALUE: value, VALUE_TYPE: 'WORK' })),
      EMAIL: broker.email ? [{ VALUE: broker.email, VALUE_TYPE: 'WORK' }] : [],
      SOURCE_DESCRIPTION: 'TREVA Broker platform — broker',
    };
    if (this.brokerContactType) fields.TYPE_ID = this.brokerContactType;
    if (companyId !== null) fields.COMPANY_ID = companyId;
    if (this.sourceId) fields.SOURCE_ID = this.sourceId;

    return this.bitrix.addContact(fields);
  }

  /** The company titled exactly as the agency (case and spacing aside), or a new one. */
  private async resolveCompany(title: string): Promise<number> {
    const wanted = normalizeName(title);
    const match = (await this.bitrix.companiesByTitle(title)).find(
      (company) => normalizeName(company.TITLE ?? '') === wanted,
    );
    if (match) return Number(match.ID);

    return this.bitrix.addCompany({
      TITLE: title,
      SOURCE_DESCRIPTION: 'TREVA Broker platform — agency',
    });
  }

  /**
   * The oldest contact holding any of the client's phone numbers. The phone is
   * the required field, so it decides — as for brokers; the email is only
   * checked for a client without a number.
   */
  private async findExistingContact(client: ClientForBitrix) {
    const phones = [
      ...new Set(
        [client.phone, ...client.additionalPhones].flatMap(phoneVariants),
      ),
    ];
    const ids = phones.length
      ? await this.bitrix.findContacts('PHONE', phones)
      : client.email
        ? await this.bitrix.findContacts('EMAIL', [client.email])
        : [];
    return ids.length ? Math.min(...ids) : null;
  }

  /**
   * Takes turns between the managers in BITRIX_DEAL_RESPONSIBLE_IDS, picking up
   * after whoever got the last deal this platform created. Null when none are
   * configured — then Bitrix's own automation decides (on Treva, bp-327 picks
   * Leyla or Nigar once "Агент (CRM)" is filled).
   */
  private async nextResponsible(): Promise<number | null> {
    if (!this.responsibleIds.length) return null;

    const last = await this.prisma.client.findFirst({
      where: { bitrixAssignedById: { not: null } },
      orderBy: { createdAt: 'desc' },
      select: { bitrixAssignedById: true },
    });
    const index = last
      ? this.responsibleIds.indexOf(last.bitrixAssignedById!)
      : -1;

    return this.responsibleIds[(index + 1) % this.responsibleIds.length];
  }

  private contactFields(client: ClientForBitrix): Record<string, unknown> {
    const fields: Record<string, unknown> = {
      NAME: client.firstName,
      LAST_NAME: client.lastName,
      PHONE: [client.phone, ...client.additionalPhones]
        .filter(Boolean)
        .map((value, index) => ({
          VALUE: value,
          VALUE_TYPE: index === 0 ? 'MOBILE' : 'WORK',
        })),
      EMAIL: client.email ? [{ VALUE: client.email, VALUE_TYPE: 'WORK' }] : [],
      SOURCE_DESCRIPTION: `TREVA Broker platform — ${client.broker.fullName}`,
    };
    if (this.sourceId) fields.SOURCE_ID = this.sourceId;
    return fields;
  }

  private async dealFields(
    client: ClientForBitrix,
    contactId: number,
    brokerLink: { contactId: number; companyId: number | null },
    assignedById: number | null,
  ): Promise<Record<string, unknown>> {
    const fullName = `${client.firstName} ${client.lastName}`.trim();
    const broker = client.broker;
    const agency = broker.company?.name ?? '';

    // Always in the comments too, so the deal reads right even where the
    // custom fields are not on the card.
    const comments = [
      `Broker: ${broker.fullName}${agency ? ` (${agency})` : ''}`,
      broker.email ? `Broker email: ${broker.email}` : '',
      broker.phones[0] ? `Broker phone: ${broker.phones[0]}` : '',
      `Object of interest: ${client.objectOfInterest}`,
      client.developerBrand ? `Developer: ${client.developerBrand}` : '',
      client.website ? `Website: ${client.website}` : '',
      client.comments ? `\n${client.comments}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const fields: Record<string, unknown> = {
      TITLE: `${fullName} — ${client.objectOfInterest} (broker: ${broker.fullName})`,
      CATEGORY_ID: this.categoryId,
      CONTACT_ID: contactId,
      COMMENTS: comments,
      SOURCE_DESCRIPTION: 'TREVA Broker platform',
    };
    if (this.stageId) fields.STAGE_ID = this.stageId;
    if (brokerLink.companyId !== null) fields.COMPANY_ID = brokerLink.companyId;
    if (this.sourceId) fields.SOURCE_ID = this.sourceId;
    if (assignedById !== null) fields.ASSIGNED_BY_ID = assignedById;

    const f = this.fields;
    if (f.agent) fields[f.agent] = broker.fullName;
    if (f.agentCrm) fields[f.agentCrm] = brokerLink.contactId;
    if (f.agency) fields[f.agency] = agency;
    if (f.fromAgent) fields[f.fromAgent] = 1;
    if (f.objectOfInterest)
      fields[f.objectOfInterest] = client.objectOfInterest;
    if (f.panelClientId) fields[f.panelClientId] = client.id;
    if (f.project) {
      const item = await this.listItem(f.project, client.objectOfInterest);
      if (item !== null) fields[f.project] = item;
    }

    return fields;
  }

  /**
   * The id of the item in a deal list field ("Проект") whose name matches the
   * text. A project the list does not have is left unset rather than guessed;
   * the title, comments and "Объект интереса" still name it.
   */
  private async listItem(code: string, text: string) {
    if (!this.fieldCache || Date.now() - this.fieldCache.at > CACHE_MS) {
      try {
        this.fieldCache = {
          fields: await this.bitrix.dealFields(),
          at: Date.now(),
        };
      } catch (error) {
        this.logger.warn(
          `Could not read Bitrix24 deal fields: ${errorMessage(error)}`,
        );
        return null;
      }
    }

    const field = this.fieldCache.fields[code];
    if (!field) {
      this.logger.warn(`Bitrix24 deals have no field ${code}`);
      return null;
    }
    if (field.type !== 'enumeration') return text;

    const wanted = normalizeName(text);
    if (!wanted) return null;
    const items = field.items ?? [];
    const match =
      items.find((item) => normalizeName(item.VALUE) === wanted) ??
      items.find((item) => {
        const name = normalizeName(item.VALUE);
        return name.includes(wanted) || wanted.includes(name);
      });

    return match?.ID ?? null;
  }

  // ─── Afterwards: Bitrix → panel ───────────────────────────────────────

  /**
   * Brings these clients up to date: sends any not yet checked, then re-reads
   * the stage of the deals not read recently.
   */
  async refresh(clientIds: string[]): Promise<void> {
    if (!this.bitrix.enabled || !clientIds.length) return;

    try {
      const rows = await this.prisma.client.findMany({
        where: { id: { in: clientIds } },
        select: {
          id: true,
          status: true,
          bitrixDealId: true,
          bitrixSyncState: true,
          bitrixSyncedAt: true,
        },
      });
      const now = Date.now();

      const unchecked = rows
        .filter(
          (row) =>
            row.status === 'pending' &&
            !(
              row.bitrixSyncState === 'failed' &&
              row.bitrixSyncedAt &&
              now - row.bitrixSyncedAt.getTime() < RETRY_AFTER_MS
            ),
        )
        .slice(0, MAX_PUSHES_PER_REFRESH);
      for (const row of unchecked) await this.push(row.id);

      const stale = rows.filter(
        (row) =>
          row.bitrixDealId !== null &&
          (!row.bitrixSyncedAt ||
            now - row.bitrixSyncedAt.getTime() > this.refreshAfterMs),
      );
      for (let i = 0; i < stale.length; i += BITRIX_PAGE_SIZE) {
        await this.pullDeals(stale.slice(i, i + BITRIX_PAGE_SIZE));
      }
    } catch (error) {
      this.logger.warn(`Refresh from Bitrix24 failed: ${errorMessage(error)}`);
    }
  }

  private async pullDeals(
    rows: { id: string; bitrixDealId: number | null }[],
  ): Promise<void> {
    const deals = await this.bitrix.deals(rows.map((row) => row.bitrixDealId!));
    const byId = new Map(deals.map((deal) => [Number(deal.ID), deal]));
    const now = new Date();

    for (const row of rows) {
      const deal = byId.get(row.bitrixDealId!);

      if (!deal) {
        await this.prisma.client.update({
          where: { id: row.id },
          data: {
            bitrixSyncState: 'failed',
            bitrixSyncError: `Deal #${row.bitrixDealId} no longer exists in Bitrix24`,
            bitrixSyncedAt: now,
          },
        });
        continue;
      }

      const stage = deal.STAGE_ID ? await this.stageInfo(deal.STAGE_ID) : null;

      await this.prisma.client.update({
        where: { id: row.id },
        data: {
          bitrixDealTitle: deal.TITLE ?? null,
          bitrixDealStage: stage?.name ?? null,
          bitrixDealStageSemantics: stage?.semantics ?? null,
          bitrixDealAmount: parseNumber(deal.OPPORTUNITY),
          bitrixDealCurrency: deal.CURRENCY_ID ?? null,
          bitrixAssignedById: parseNumber(deal.ASSIGNED_BY_ID),
          bitrixSyncState: 'synced',
          bitrixSyncError: null,
          bitrixSyncedAt: now,
        },
      });
    }
  }

  /** A deal stage's name and semantics; its raw id if the list is unreadable. */
  private async stageInfo(stageId: string): Promise<StageInfo> {
    if (!this.stageCache || Date.now() - this.stageCache.at > CACHE_MS) {
      try {
        const stages = new Map<string, StageInfo>();
        for (const row of await this.bitrix.statuses()) {
          // "DEAL_STAGE" for the main pipeline, "DEAL_STAGE_<id>" for others,
          // whose stage ids already carry a "C<id>:" prefix.
          if (row.ENTITY_ID.startsWith('DEAL_STAGE')) {
            stages.set(row.STATUS_ID, {
              name: row.NAME,
              semantics: semanticsOf(row),
            });
          }
        }
        this.stageCache = { stages, at: Date.now() };
      } catch (error) {
        this.logger.warn(
          `Could not read Bitrix24 deal stages: ${errorMessage(error)}`,
        );
      }
    }

    return (
      this.stageCache?.stages.get(stageId) ?? {
        name: stageId,
        semantics: fallbackSemantics(stageId),
      }
    );
  }
}
