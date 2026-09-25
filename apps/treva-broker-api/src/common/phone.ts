import { Prisma } from '../generated/prisma/client';
import type { PrismaService } from '../prisma/prisma.service';

/**
 * One spelling per phone number, so "+994 50 311 44 21", "050-311-44-21",
 * "994503114421" and "503114421" all compare equal: Azerbaijani numbers become
 * 994 + their nine local digits, anything else its digits alone. Null for a
 * value with no digits.
 *
 * `PHONE_KEY_SQL` is the same rule in PostgreSQL — change both together.
 */
export function phoneKey(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return null;
  if (/^994\d{9}$/.test(digits)) return digits;
  if (/^0\d{9}$/.test(digits)) return `994${digits.slice(1)}`;
  if (/^\d{9}$/.test(digits)) return `994${digits}`;
  return digits;
}

/** `phoneKey` for the SQL column or expression `num`. */
export const PHONE_KEY_SQL = `
  CASE
    WHEN regexp_replace(num, '\\D', '', 'g') ~ '^994[0-9]{9}$'
      THEN regexp_replace(num, '\\D', '', 'g')
    WHEN regexp_replace(num, '\\D', '', 'g') ~ '^0[0-9]{9}$'
      THEN '994' || substr(regexp_replace(num, '\\D', '', 'g'), 2)
    WHEN regexp_replace(num, '\\D', '', 'g') ~ '^[0-9]{9}$'
      THEN '994' || regexp_replace(num, '\\D', '', 'g')
    ELSE regexp_replace(num, '\\D', '', 'g')
  END`;

/** The distinct keys of these numbers, blanks dropped. */
export function phoneKeys(phones: string[]): string[] {
  return [
    ...new Set(
      phones.map(phoneKey).filter((key): key is string => key !== null),
    ),
  ];
}

/**
 * Whether another client already holds any of these numbers, as the main or an
 * additional one — whichever broker registered them.
 */
export async function clientPhoneTaken(
  prisma: PrismaService,
  phones: string[],
  exceptId = '',
): Promise<boolean> {
  const keys = phoneKeys(phones);
  if (!keys.length) return false;

  const rows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT c.id
    FROM "Client" c,
      unnest(array_prepend(c.phone, c."additionalPhones")) AS p(num)
    WHERE ${Prisma.raw(PHONE_KEY_SQL)} = ANY(${keys}::text[])
      AND c.id <> ${exceptId}
    LIMIT 1`;
  return rows.length > 0;
}

/** Whether another account (broker, top broker or admin) holds any of these. */
export async function userPhoneTaken(
  prisma: PrismaService | Prisma.TransactionClient,
  phones: string[],
  exceptId = '',
): Promise<boolean> {
  const keys = phoneKeys(phones);
  if (!keys.length) return false;

  const rows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT u.id
    FROM "User" u, unnest(u.phones) AS p(num)
    WHERE ${Prisma.raw(PHONE_KEY_SQL)} = ANY(${keys}::text[])
      AND u.id <> ${exceptId}
    LIMIT 1`;
  return rows.length > 0;
}

/** What a broker-number clash answers with, wherever an account is saved. */
export const USER_PHONE_TAKEN = {
  message: 'This phone number is already used by another account',
  code: 'phone_taken',
} as const;
