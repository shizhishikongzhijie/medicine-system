/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: [
        '@douyinfe/semi-ui',
        '@douyinfe/semi-icons',
        '@douyinfe/semi-illustrations'
    ],
    async redirects() {
        return [
            {
                source: "/",
                destination: "/home",
                permanent: true,
            },
        ];
    },
    devIndicators: {
        buildActivity: true,
        buildActivityPosition: 'bottom-right',
    },
    reactStrictMode: true,
};
export default nextConfig;