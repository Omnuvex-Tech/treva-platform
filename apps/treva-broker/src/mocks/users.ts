import type { PlatformUser } from "@/features/users/types";

function daysAgo(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    date.setHours(10, 0, 0, 0);
    return date.toISOString();
}

/** Every row in the artboard signs in on the same day (873:48560). */
const LAST_LOGIN = "2025-04-18T10:00:00.000Z";

/**
 * Stands in for the API's user table until the NestJS service exists.
 *
 * These are the eight rows 873:48476 draws, in its order — the table body fills
 * one page exactly, which is why the artboard hides the pager. Keeping the
 * fixtures identical to the artboard is what lets the screen be checked against
 * it by eye.
 *
 * Three ids are deliberately not sequential: `usr_admin_1`, `usr_broker_1` and
 * `usr_top_broker_1` are the ones features/auth/api/auth.mock.ts hands out at
 * sign-in, so keeping them here is what lets Profile resolve the signed-in
 * account against this table. The names differ from the login fixture's; only
 * the id is load-bearing.
 */
export const MOCK_USERS: PlatformUser[] = [
    {
        id: "usr_admin_1",
        firstName: "Anar",
        lastName: "Rzayev",
        email: "anar.rzayev@bp.az",
        password: "anar123",
        phone: "+994 50 292 62 12",
        role: "admin",
        organization: "Headquarters",
        jobTitle: "Platform Administrator",
        cooperationType: "exclusive",
        agentlik: "Deha Emlak",
        agency: "Deha Emlak",
        accessPermission: "full",
        status: "active",
        lastLoginAt: LAST_LOGIN,
        createdAt: daysAgo(420),
    },
    {
        id: "usr_broker_1",
        firstName: "Nigar",
        lastName: "Hasanova",
        email: "nigar.hasanova@bp.az",
        password: "nigar123",
        phone: "+994 50 301 35 05",
        role: "broker",
        organization: "Deha Emlak",
        jobTitle: "Sales Broker",
        cooperationType: "exclusive",
        agentlik: "Deha Emlak",
        agency: "Deha Emlak",
        accessPermission: "standard",
        status: "active",
        lastLoginAt: LAST_LOGIN,
        createdAt: daysAgo(360),
    },
    {
        id: "usr_3",
        firstName: "Elvin",
        lastName: "Məmmədov",
        email: "elvin.mammadov@bp.az",
        password: "elvin123",
        phone: "+994 50 301 35 05",
        role: "broker",
        organization: "Ag Emlak",
        jobTitle: "Sales Broker",
        cooperationType: "partner",
        agentlik: "Ag Emlak",
        agency: "Ag Emlak",
        accessPermission: "standard",
        status: "active",
        lastLoginAt: LAST_LOGIN,
        createdAt: daysAgo(300),
    },
    {
        id: "usr_4",
        firstName: "Leyla",
        lastName: "Əliyeva",
        email: "leyla.aliyeva@bp.az",
        password: "leyla123",
        phone: "+994 55 411 22 07",
        role: "broker",
        organization: "Ag Emlak",
        jobTitle: "Sales Broker",
        cooperationType: "partner",
        agentlik: "Ag Emlak",
        agency: "Ag Emlak",
        accessPermission: "standard",
        status: "active",
        lastLoginAt: LAST_LOGIN,
        createdAt: daysAgo(240),
    },
    {
        id: "usr_top_broker_1",
        firstName: "Kamran",
        lastName: "Hüseynov",
        email: "kamran.huseynov@bp.az",
        password: "kamran123",
        phone: "+994 55 411 22 08",
        role: "top_broker",
        organization: "Kamila Guseinova",
        jobTitle: "Team Lead",
        cooperationType: "exclusive",
        agentlik: "Kamila Guseinova",
        agency: "Kamila Guseinova",
        accessPermission: "extended",
        status: "active",
        lastLoginAt: LAST_LOGIN,
        createdAt: daysAgo(190),
    },
    {
        id: "usr_6",
        firstName: "Günel",
        lastName: "Babayeva",
        email: "gunel.babayeva@bp.az",
        password: "gunel123",
        phone: "+994 70 330 44 11",
        role: "broker",
        organization: "Deha Emlak",
        jobTitle: "Sales Broker",
        cooperationType: "partner",
        agentlik: "Deha Emlak",
        agency: "Deha Emlak",
        accessPermission: "standard",
        status: "blocked",
        lastLoginAt: LAST_LOGIN,
        createdAt: daysAgo(180),
    },
    {
        id: "usr_7",
        firstName: "Rauf",
        lastName: "İsmayılov",
        email: "rauf.ismayilov@bp.az",
        password: "rauf123",
        phone: "+994 70 657 75 79",
        role: "broker",
        organization: "Ag Emlak",
        jobTitle: "Sales Broker",
        cooperationType: "partner",
        agentlik: "Ag Emlak",
        agency: "Ag Emlak",
        accessPermission: "standard",
        status: "active",
        lastLoginAt: LAST_LOGIN,
        createdAt: daysAgo(21),
    },
    {
        id: "usr_8",
        firstName: "Sevinc",
        lastName: "Quliyeva",
        email: "sevinc.quliyeva@bp.az",
        password: "sevinc.123",
        phone: "+994 70 657 75 79",
        role: "broker",
        organization: "Deha Emlak",
        jobTitle: "Junior Broker",
        cooperationType: "partner",
        agentlik: "Deha Emlak",
        agency: "Deha Emlak",
        accessPermission: "standard",
        status: "active",
        lastLoginAt: LAST_LOGIN,
        createdAt: daysAgo(14),
    },
];
