/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@repo/ui", "@repo/shared", "@repo/types"],
    async rewrites() {
        return [
            {
                source: "/uploads/:path*",
                destination: `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:10021"}/uploads/:path*`,
            },
        ];
    },
};

export default nextConfig;
