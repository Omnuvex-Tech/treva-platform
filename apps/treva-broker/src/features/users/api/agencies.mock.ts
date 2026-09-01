import { delay, searchBy } from "@/lib/api/mock";
import { ApiError } from "@/lib/api/errors";
import { MOCK_AGENCIES } from "@/mocks/agencies";
import type { Agency, AgencyInput } from "../types";

let agencies: Agency[] = [...MOCK_AGENCIES];

export async function list(search?: string): Promise<Agency[]> {
    await delay();
    return searchBy(agencies, search, ["name", "managerName", "phone", "email", "organization"]);
}

export async function create(input: AgencyInput): Promise<Agency> {
    await delay();

    const agency: Agency = { id: `ag_${Date.now()}`, ...input };
    agencies = [agency, ...agencies];
    return agency;
}

export async function update(id: string, input: Partial<AgencyInput>): Promise<Agency> {
    await delay();

    const index = agencies.findIndex((entry) => entry.id === id);
    if (index === -1) throw new ApiError("Agency not found", 404, "not_found");

    const updated: Agency = { ...agencies[index]!, ...input };
    agencies = agencies.map((entry, entryIndex) => (entryIndex === index ? updated : entry));
    return updated;
}

export async function remove(id: string): Promise<void> {
    await delay();

    if (!agencies.some((entry) => entry.id === id)) {
        throw new ApiError("Agency not found", 404, "not_found");
    }

    agencies = agencies.filter((entry) => entry.id !== id);
}
