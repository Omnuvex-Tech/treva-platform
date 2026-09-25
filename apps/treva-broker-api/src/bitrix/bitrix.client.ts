import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Bitrix never gets more than this: a client is saved in the panel first, so a
 * slow portal only delays the outcome, never the broker's form or list.
 */
const REQUEST_TIMEOUT_MS = 10_000;

/** Bitrix list methods page at 50 rows; also the cap on an `ID: [...]` filter. */
export const BITRIX_PAGE_SIZE = 50;

/** crm.duplicate.findbycomm takes at most this many values per call. */
const MAX_DUPLICATE_VALUES = 20;

/** A safety stop for paging a method whose `next` never runs out. */
const MAX_PAGES = 40;

interface BitrixEnvelope<T> {
  result?: T;
  next?: number;
  total?: number;
  error?: string;
  error_description?: string;
}

/** A failed Bitrix call, with Bitrix's own error code where it sent one. */
export class BitrixError extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
    this.name = 'BitrixError';
  }
}

/** Every Bitrix field value comes back as a string, ids included. */
export interface BitrixDeal {
  ID: string;
  TITLE: string | null;
  STAGE_ID: string | null;
  OPPORTUNITY: string | null;
  CURRENCY_ID: string | null;
  ASSIGNED_BY_ID: string | null;
}

/** One entry of `crm.deal.fields`; `items` only on a list (enumeration). */
export interface BitrixFieldInfo {
  type: string;
  items?: { ID: string; VALUE: string }[];
}

/** A row of `crm.status.list` — here, deal stages. */
export interface BitrixStatus {
  ENTITY_ID: string;
  STATUS_ID: string;
  NAME: string;
  /** "process" | "success" | "failure" | "apology" on treva.bitrix24.ru. */
  EXTRA?: { SEMANTICS?: string | null } | null;
  SEMANTICS?: string | null;
}

/**
 * Bitrix24's REST API over an inbound webhook
 * (`https://<portal>/rest/<user>/<secret>/`), which needs the `crm` scope.
 *
 * With BITRIX_WEBHOOK_URL unset the integration is off: `enabled` is false and
 * callers leave clients as `pending` instead of failing them, so a developer
 * without Bitrix access can still run the panel.
 */
@Injectable()
export class BitrixClient {
  private readonly baseUrl: string | null;

  constructor(config: ConfigService) {
    const url = config.get<string>('BITRIX_WEBHOOK_URL')?.trim();
    this.baseUrl = url ? `${url.replace(/\/+$/, '')}/` : null;
  }

  get enabled() {
    return this.baseUrl !== null;
  }

  private async request<T>(
    method: string,
    params: object,
  ): Promise<BitrixEnvelope<T>> {
    if (!this.baseUrl) {
      throw new BitrixError('Bitrix24 is not configured', 'not_configured');
    }

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${method}.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(params),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch {
      throw new BitrixError(
        `Bitrix24 could not be reached (${method})`,
        'unreachable',
      );
    }

    let body: BitrixEnvelope<T> | null = null;
    try {
      body = (await response.json()) as BitrixEnvelope<T>;
    } catch {
      // A proxy's HTML error page, say — reported by status below.
    }

    if (!response.ok || !body || body.error) {
      const detail =
        body?.error_description || body?.error || `HTTP ${response.status}`;
      throw new BitrixError(
        `Bitrix24 ${method} failed: ${detail}`,
        body?.error ?? 'http_error',
      );
    }

    return body;
  }

  async call<T>(method: string, params: object = {}): Promise<T> {
    return (await this.request<T>(method, params)).result as T;
  }

  /** Every page of a list method, following `next`. */
  async all<T>(method: string, params: object = {}): Promise<T[]> {
    const rows: T[] = [];
    let start: number | undefined = 0;

    for (let page = 0; start !== undefined && page < MAX_PAGES; page += 1) {
      const body: BitrixEnvelope<T[]> = await this.request<T[]>(method, {
        ...params,
        start,
      });
      rows.push(...(body.result ?? []));
      start = body.next;
    }

    return rows;
  }

  /**
   * Ids of the contacts holding any of these phone numbers or emails. Bitrix
   * compares numbers by their digits, so callers pass the spellings a number
   * is commonly stored under (see BitrixSyncService.phoneVariants).
   */
  async findContacts(type: 'PHONE' | 'EMAIL', values: string[]) {
    const ids = new Set<number>();

    for (let i = 0; i < values.length; i += MAX_DUPLICATE_VALUES) {
      // `[]` when nothing matched, `{ CONTACT: [ids] }` when something did.
      const result = await this.call<{ CONTACT?: (number | string)[] } | []>(
        'crm.duplicate.findbycomm',
        {
          entity_type: 'CONTACT',
          type,
          values: values.slice(i, i + MAX_DUPLICATE_VALUES),
        },
      );
      if (!Array.isArray(result)) {
        for (const id of result.CONTACT ?? []) ids.add(Number(id));
      }
    }

    return [...ids].sort((a, b) => a - b);
  }

  /** Returns the new contact's id. */
  async addContact(fields: Record<string, unknown>): Promise<number> {
    return Number(
      await this.call<number | string>('crm.contact.add', {
        fields,
        params: { REGISTER_SONET_EVENT: 'Y' },
      }),
    );
  }

  /** Returns the new company's id. */
  async addCompany(fields: Record<string, unknown>): Promise<number> {
    return Number(
      await this.call<number | string>('crm.company.add', {
        fields,
        params: { REGISTER_SONET_EVENT: 'Y' },
      }),
    );
  }

  /** Companies whose title contains this text; callers pick the exact one. */
  companiesByTitle(title: string) {
    return this.call<{ ID: string; TITLE: string }[]>('crm.company.list', {
      filter: { '%TITLE': title },
      select: ['ID', 'TITLE'],
      order: { ID: 'ASC' },
    });
  }

  /** Returns the new deal's id. */
  async addDeal(fields: Record<string, unknown>): Promise<number> {
    return Number(
      await this.call<number | string>('crm.deal.add', {
        fields,
        params: { REGISTER_SONET_EVENT: 'Y' },
      }),
    );
  }

  /** At most BITRIX_PAGE_SIZE ids per call; a deleted deal is simply absent. */
  deals(ids: number[]) {
    return this.call<BitrixDeal[]>('crm.deal.list', {
      filter: { ID: ids },
      select: [
        'ID',
        'TITLE',
        'STAGE_ID',
        'OPPORTUNITY',
        'CURRENCY_ID',
        'ASSIGNED_BY_ID',
      ],
    });
  }

  /** The deal's fields, keyed by code — for resolving a list field's items. */
  dealFields() {
    return this.call<Record<string, BitrixFieldInfo>>('crm.deal.fields');
  }

  /** Every status list — deal stages of every pipeline among them. */
  statuses() {
    return this.all<BitrixStatus>('crm.status.list', {
      order: { SORT: 'ASC' },
    });
  }
}
