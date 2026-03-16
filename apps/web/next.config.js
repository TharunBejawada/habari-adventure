// apps/web/next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/uploads/**', // Allows all images inside your uploads folder
      },
      // Pro-Tip: Add your future production backend domain here now so you don't forget later!
      {
        protocol: 'https',
        hostname: 'habari-adventure.onrender.com', // Replace with your actual production API domain
        pathname: '/uploads/**',
      }
    ],
  },
};

export default nextConfig;