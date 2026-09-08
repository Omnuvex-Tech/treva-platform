import type { MetadataRoute } from "next";
import { project } from "@/config/project";

/**
 * robots.txt for the public site, served at /robots.txt.
 *
 * Points crawlers at the sitemap and keeps the user-specific, non-indexable
 * pages (wishlist, compare) out of the index.
 */
const BASE = project.url.replace(/\/+$/, "");

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/api/", "/wishlist", "/compare", "/*/wishlist", "/*/compare"],
            },
        ],
        sitemap: `${BASE}/sitemap.xml`,
        host: BASE,
    };
}
