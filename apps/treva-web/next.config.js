/** @type {import('next').NextConfig} */
const trevaApiUrl = process.env.NEXT_PUBLIC_TREVA_API_URL || "http://localhost:10011/api/v1";
const trevaOrigin = new URL(trevaApiUrl).origin;

const nextConfig = {
    transpilePackages: ["@repo/ui", "@repo/shared", "@repo/types"],
    images: {
        remotePatterns: [
            { protocol: "http", hostname: "localhost" },
            { protocol: "https", hostname: "images.unsplash.com" },
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
