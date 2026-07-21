/** @type {import('next').NextConfig} */
const trevaApiUrl = process.env.NEXT_PUBLIC_TREVA_API_URL || "http://localhost:10011/api/v1";
const trevaOrigin = new URL(trevaApiUrl).origin;
const cmsApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:10021";
const cmsOrigin = new URL(cmsApiUrl);

const nextConfig = {
    transpilePackages: ["@repo/ui", "@repo/shared", "@repo/types"],
    images: {
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
