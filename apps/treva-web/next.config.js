/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@repo/ui", "@repo/shared", "@repo/types"],
    async rewrites() {
        return [
            {
                source: "/uploads/:path*",
                destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/uploads/:path*`,
            },
        ];
    },
};

export default nextConfig;
