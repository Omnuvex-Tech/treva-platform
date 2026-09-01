import { http } from "@/lib/api/http";
import { endpoints } from "@/config/endpoints";
import type { Agency, AgencyInput } from "../types";

/** Real adapter — see the note in features/auth/api/auth.http.ts. */
export async function list(search?: string): Promise<Agency[]> {
    return http.get<Agency[]>(endpoints.agencies.list, { params: { search } });
}

export async function create(input: AgencyInput): Promise<Agency> {
    return http.post<Agency>(endpoints.agencies.list, input);
}

export async function update(id: string, input: Partial<AgencyInput>): Promise<Agency> {
    return http.patch<Agency>(endpoints.agencies.detail(id), input);
}

export async function remove(id: string): Promise<void> {
    await http.delete<void>(endpoints.agencies.detail(id));
}
