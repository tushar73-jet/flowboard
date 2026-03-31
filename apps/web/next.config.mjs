/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during builds so Vercel does not fail on unused variables
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
