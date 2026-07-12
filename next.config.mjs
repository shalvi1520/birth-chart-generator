/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    '/api/birth-chart': ['./node_modules/geo-tz/data/**/*'],
  },
};

export default nextConfig;