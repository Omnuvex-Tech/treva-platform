import { project } from "./project";
import { api } from "./api";
import { endpoints } from "./endpoints";
import { staticContent } from "./static-content";

export const config = {
    project,
    api,
    endpoints,
    staticContent,
} as const;

export { system } from "./system";
