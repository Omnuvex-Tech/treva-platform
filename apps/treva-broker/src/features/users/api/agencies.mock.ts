import { delay, searchBy } from "@/lib/api/mock";
import { ApiError } from "@/lib/api/errors";
import { MOCK_AGENCIES } from "@/mocks/agencies";
import { MOCK_USERS } from "@/mocks/users";
import type { Agency, AgencyInput, ManagerOption } from "../types";

let agencies: Agency[] = [...MOCK_AGENCIES];

export async function list(search?: string): Promise<Agency[]> {
    await delay();
    return searchBy(agencies, search, ["name", "managerName", "phones", "email", "organization"]);
}

export async function managers(): Promise<ManagerOption[]> {
    await delay();

    // The fixtures carry no company link, so "belongs to no agency" is read
    // off the agency field the User tab already shows.
    return MOCK_USERS.filter((user) => !user.agency).map((user) => ({
        id: user.id,
        fullName: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        phones: user.phones,
    }));
}

export async function detail(id: string): Promise<Agency> {
    await delay();

    const agency = agencies.find((entry) => entry.id === id);
    if (!agency) throw new ApiError("Agency not found", 404, "not_found");
    return agency;
}

export async function create(input: AgencyInput): Promise<Agency> {
    await delay();

    // Mirrors the real service: a chosen account supplies the manager's name
    // and address, and only a manager being created brings its own.
    const chosen = MOCK_USERS.find((user) => user.id === input.managerId);

    const agency: Agency = {
        id: `ag_${Date.now()}`,
        name: input.name,
        managerId: input.managerId || `usr_${Date.now()}`,
        managerName: chosen
            ? `${chosen.firstName} ${chosen.lastName}`.trim()
            : (input.managerName ?? ""),
        phones: input.phones,
        organization: input.organization,
        email: chosen ? chosen.email : (input.email ?? ""),
    };

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
