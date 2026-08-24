/** @type {import('next').NextConfig} */
const trevaApiUrl = process.env.NEXT_PUBLIC_TREVA_API_URL || "http://localhost:10011/api/v1";
const trevaOrigin = new URL(trevaApiUrl).origin;
const cmsApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:10021";
const cmsOrigin = new URL(cmsApiUrl);

const nextConfig = {
    transpilePackages: ["@repo/ui", "@repo/shared", "@repo/types"],
    images: {
        /**
         * Next 16 resolves every remote image host and refuses any that lands on
         * a private IP — an SSRF guard. In local development the CMS and the
         * treva-api are both on localhost, so every avatar and cover is rejected
         * with `"url" parameter is not allowed`, which reads like a
         * remotePatterns problem but is not one.
         *
         * Only lifted outside production. In production the guard is what stops
         * a user-supplied image URL from reaching the internal network, so it
         * must stay on there.
         */
        dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
        remotePatterns: [
            { protocol: "http", hostname: "localhost" },
            { protocol: "https", hostname: "images.unsplash.com" },
            { protocol: "https", hostname: "cdn.prod.website-files.com" },
            {
                protocol: cmsOrigin.protocol.replace(":", ""),
                hostname: cmsOrigin.hostname,
                port: cmsOrigin.port || undefined,
            },
        ],
    },
    async rewrites() {
        return [
            {
                source: "/uploads/:path*",
                destination: `${trevaOrigin}/uploads/:path*`,
            },
        ];
    },
};

export default nextConfig;
