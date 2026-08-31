/** @type {import('next').NextConfig} */

const brokerApiUrl = process.env.NEXT_PUBLIC_BROKER_API_URL || "http://localhost:10041/api/v1";
const brokerApiOrigin = new URL(brokerApiUrl);

const nextConfig = {
    /**
     * `forbidden()` from next/navigation (used by lib/auth/guard.ts to turn a
     * failed permission check into a real 403 + forbidden.tsx) is still behind
     * this flag in Next 16.2. Without it the import resolves but the call
     * throws at runtime.
     */
    experimental: {
        authInterrupts: true,
    },
    transpilePackages: ["@repo/shared", "@repo/types"],
    images: {
        /**
         * Next 16 refuses any remote image host that resolves to a private IP
         * (an SSRF guard). Locally the broker API sits on localhost, so every
         * avatar and project cover would be rejected with
         * `"url" parameter is not allowed`. Lifted outside production only —
         * in production the guard is what keeps a user-supplied image URL from
         * reaching the internal network. Same reasoning as treva-web.
         */
        dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
        remotePatterns: [
            { protocol: "http", hostname: "localhost" },
            { protocol: "https", hostname: "images.unsplash.com" },
            {
                protocol: brokerApiOrigin.protocol.replace(":", ""),
                hostname: brokerApiOrigin.hostname,
                port: brokerApiOrigin.port || undefined,
            },
        ],
    },
    async rewrites() {
        return [
            {
                source: "/uploads/:path*",
                destination: `${brokerApiOrigin.origin}/uploads/:path*`,
            },
        ];
    },
};

export default nextConfig;
