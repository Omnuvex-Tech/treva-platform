import { normalizer } from "@repo/shared/utils";

export const project = {
    url: normalizer.string(process.env.NEXT_PUBLIC_APP_URL),
    name: normalizer.string(process.env.NEXT_PUBLIC_APP_NAME),
    projectName: "Treva",
    projectDescription: "Treva",
    keywords: ["Treva"],
    defLang: "az",
} as const;
