import type { Agency } from "@/features/users/types";

/**
 * The five rows drawn in the Real Estate Agencies tab, copied verbatim —
 * including the blank Organization cells and the placeholder last row — so a
 * side-by-side review against the artboard is meaningful.
 */
export const MOCK_AGENCIES: Agency[] = [
    {
        id: "ag_1",
        name: "Deha Emlak",
        managerName: "Abdullayev Elvin Khan",
        phone: "+994 50-292-62-12",
        organization: "",
        email: "dehabaku@gmail.com",
    },
    {
        id: "ag_2",
        name: "Kamila Guseinova",
        managerName: "Guseinov Kamaliya Mirkamal",
        phone: "+972 54-970-7888",
        organization: "",
        email: "kamilarafael16@gmail.com",
    },
    {
        id: "ag_3",
        name: "Elvin Mammadov",
        managerName: "Ag Emlak",
        phone: "+994 50-301-35-05",
        organization: "",
        email: "agemlak2025@gmail.com",
    },
    {
        id: "ag_4",
        name: "Ag Emlak",
        managerName: "Chalabizada Faan",
        phone: "+994 70-657-75-79",
        organization: "",
        email: "",
    },
    {
        id: "ag_5",
        name: "Test",
        managerName: "Test",
        phone: "+994 70-657-75-79",
        organization: "",
        email: "",
    },
];
