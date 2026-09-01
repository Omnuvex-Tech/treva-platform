import type { Building, Floor, Unit, UnitStatus } from "@/features/floor-plan/types";

/**
 * The artboard draws an 18-floor stack, 8 units wide, in 28x28 cells.
 */
const FLOORS = 18;
const UNITS_PER_FLOOR = 8;

/**
 * A tiny deterministic PRNG (mulberry32).
 *
 * `Math.random()` would reshuffle every unit on each request, so the grid would
 * flicker between renders and a screenshot could never be compared with the
 * previous one. Seeded per building, the layout is stable but not uniform.
 */
function seeded(seed: number): () => number {
    let state = seed;

    return () => {
        state |= 0;
        state = (state + 0x6d2b79f5) | 0;
        let t = Math.imul(state ^ (state >>> 15), 1 | state);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function pickStatus(random: () => number, floor: number): UnitStatus {
    const roll = random();

    // Lower floors sell first, so availability climbs with height — the shape a
    // real stacking plan has, which makes the grid worth looking at.
    const soldBias = (FLOORS - floor) / FLOORS;

    if (roll < 0.06) return "blocked";
    if (roll < 0.1 + soldBias * 0.45) return "sold";
    if (roll < 0.28 + soldBias * 0.45) return "reserved";
    return "available";
}

function buildFloors(seed: number): Floor[] {
    const random = seeded(seed);
    const floors: Floor[] = [];

    // Top floor first: the grid reads downwards from F18 to F1.
    for (let level = FLOORS; level >= 1; level -= 1) {
        const units: Unit[] = [];

        for (let position = 1; position <= UNITS_PER_FLOOR; position += 1) {
            const bedrooms = position <= 2 ? 1 : position <= 6 ? 2 : 3;
            const areaSqm = bedrooms === 1 ? 54 : bedrooms === 2 ? 86 : 128;

            units.push({
                id: `u_${seed}_${level}_${position}`,
                code: `${level}${String(position).padStart(2, "0")}`,
                position,
                floor: level,
                status: pickStatus(random, level),
                bedrooms,
                areaSqm,
                // Higher floors carry a premium, as they do in the real price list.
                price: Math.round((areaSqm * 2_050 + level * 1_400) / 100) * 100,
            });
        }

        floors.push({ level, label: `F${level}`, units });
    }

    return floors;
}

function countStatuses(floors: Floor[]): Record<UnitStatus, number> {
    const counts: Record<UnitStatus, number> = {
        available: 0,
        reserved: 0,
        sold: 0,
        blocked: 0,
    };

    for (const floor of floors) {
        for (const unit of floor.units) {
            counts[unit.status] += 1;
        }
    }

    return counts;
}

function makeBuilding(id: string, name: string, projectName: string, seed: number): Building {
    const floors = buildFloors(seed);
    return { id, name, projectName, floors, counts: countStatuses(floors) };
}

export const MOCK_BUILDINGS: Building[] = [
    makeBuilding("bld_a", "Tower A", "Pearl Towers", 20250401),
    makeBuilding("bld_b", "Tower B", "Pearl Towers", 20250402),
    makeBuilding("bld_c", "Seaside Block", "Seaside Residence", 20250403),
];
