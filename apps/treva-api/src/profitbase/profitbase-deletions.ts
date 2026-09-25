import { PrismaService } from '../prisma/prisma.service';

export type ProfitbaseEntity = 'category' | 'house' | 'unitLayout';

/**
 * Remembers that a synced record was deleted in the panel, so the next
 * Transfer does not create it again. Called before the delete: if the delete
 * then fails, the record still exists and the sync never looks here for it.
 */
export async function rememberProfitbaseDeletion(
  prisma: PrismaService,
  entity: ProfitbaseEntity,
  externalId: string | null,
): Promise<void> {
  if (!externalId) return;
  await prisma.profitbaseDeletion.upsert({
    where: { entity_externalId: { entity, externalId } },
    update: {},
    create: { entity, externalId },
  });
}
