// apps/web/next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/Climbing/Kilimanjaro/Packages/8DaysLemosho.html',
        destination: '/en/climbing/kilimanjaro/8-days-lemosho-route-climb-kosovo',
        permanent: true,
      },
      {
        source: '/Climbing/Kilimanjaro/index.html',
        destination: '/en/climbing/kilimanjaro',
        permanent: true,
      },
      {
        source: '/Climbing/Kilimanjaro/Packages/7DaysLemosho.html',
        destination: '/en/climbing/kilimanjaro/7-days-lemosho-route-climb',
        permanent: true,
      },
      {
        source: '/Safari/index.html',
        destination: '/en/safari/safari',
        permanent: true,
      },
      {
        source: '/About/AboutUs.html',
        destination: '/en/about',
        permanent: true,
      },
    ];
  },
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
        hostname: 'development-habari.habariadventure.com', // Replace with your actual production API domain
        pathname: '/uploads/**',
      }
    ],
  },
};

export default nextConfig;