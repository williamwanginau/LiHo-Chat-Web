/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const target = process.env.NEXT_PUBLIC_API_URL;
    if (!target) {
      console.warn('[next.config] NEXT_PUBLIC_API_URL not set; /api/* proxy disabled');
      return [];
    }
    const base = target.replace(/\/+$/, '');
    return [
      {
        source: '/api/:path*',
        destination: `${base}/:path*`,
      },
    ];
  },
};

export default nextConfig;
