import { apiConfig, appConfig } from "./app";

export const config = {
    app: appConfig,
    api: apiConfig,
} as const;

export { appConfig, apiConfig } from "./app";
export { routes, HOME_ROUTE, PUBLIC_PATHS, isPublicPath } from "./routes";
export { NAV_ITEMS, visibleNavItems } from "./navigation";
export type { NavItem } from "./navigation";
export { endpoints } from "./endpoints";
