import type { Session } from "@/types/auth";
import { isRole } from "./roles";

export const SESSION_COOKIE = "treva_broker_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

/**
 * The session is stored base64url-encoded rather than as raw JSON purely so a
 * cookie value never contains characters that need escaping.
 *
 * This is NOT a security boundary — it is not signed and anyone can forge it.
 * That is acceptable while the mock adapter is the only data source; the moment
 * the NestJS API is wired up this must become an httpOnly cookie holding a
 * signed token that the API validates on every request. Nothing outside this
 * file knows how the session is encoded, so that swap stays local.
 */
export function encodeSession(session: Session): string {
    const json = JSON.stringify(session);
    return Buffer.from(json, "utf8").toString("base64url");
}

export function decodeSession(value: string | undefined): Session | null {
    if (!value) return null;

    try {
        const json = Buffer.from(value, "base64url").toString("utf8");
        const parsed: unknown = JSON.parse(json);

        if (!isSessionShape(parsed)) return null;
        if (new Date(parsed.expiresAt).getTime() <= Date.now()) return null;

        return parsed;
    } catch {
        // A malformed or truncated cookie is treated as "signed out" rather than
        // as an error — otherwise every page render throws until the user
        // manually clears it.
        return null;
    }
}

function isSessionShape(value: unknown): value is Session {
    if (typeof value !== "object" || value === null) return false;

    const candidate = value as Partial<Session>;
    const user = candidate.user;

    return (
        typeof candidate.expiresAt === "string" &&
        typeof user === "object" &&
        user !== null &&
        typeof user.id === "string" &&
        typeof user.email === "string" &&
        isRole(user.role)
    );
}
