import type { Project } from "./types";

/**
 * A blank project.
 *
 * Shared by the create screen — which needs something for its inputs to bind to
 * before anything is saved — and by the mock adapter's `create`, which needs the
 * same skeleton to fill the fields the editor does not own. Keeping one copy is
 * what stops a field added to `Project` from being defaulted two different ways.
 */
export function emptyProject(): Project {
    const now = new Date().toISOString();

    return {
        id: "",
        name: "",
        developer: "",
        location: "",
        status: "active",
        priceFrom: 0,
        unitsTotal: 0,
        unitsAvailable: 0,
        bedroomsFrom: 0,
        bedroomsTo: 0,
        deliveryDate: "",
        updatedAt: now,
        coverImageUrl: null,
        publicUrl: "",
        heroImageUrl: null,
        galleryImageUrls: [],
        highlights: [],
        offers: [],
        materials: [],
        availability: {
            available: 0,
            reserved: 0,
            sold: 0,
            autoCalculate: true,
            lastSyncedAt: now,
        },
        financeRows: [],
        layouts: [],
    };
}
