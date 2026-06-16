// apps/web/next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // --- Existing Redirects (5) ---
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

      // --- New Unique Redirects (30) ---
      {
        source: '/',
        destination: '/en',
        permanent: true,
      },
      {
        source: '/About/Whychooseus.html',
        destination: '/en/about',
        permanent: true,
      },
      {
        source: '/Climbing/Kenya/index.html',
        destination: '/en/climbing/mount-kenya',
        permanent: true,
      },
      {
        source: '/Climbing/Kilimanjaro/Packages/7DaysRongai.html',
        destination: '/en/climbing/kilimanjaro/7-days-lemosho-route-climb',
        permanent: true,
      },
      {
        source: '/ContactUs.html',
        destination: '/en/contact',
        permanent: true,
      },
      {
        source: '/Footer/Company/OurServices.html',
        destination: '/en/services',
        permanent: true,
      },
      {
        source: '/index.html',
        destination: '/en',
        permanent: true,
      },
      {
        source: '/SiteLayout/footer.html',
        destination: '/en',
        permanent: true,
      },
      {
        source: '/2021-travel-dates',
        destination: '/en',
        permanent: true,
      },
      {
        source: '/7-days-machame-route',
        destination: '/en/climbing/machame-route/7-days-machame-route',
        permanent: true,
      },
      {
        source: '/About/Crew.html',
        destination: '/en/crew',
        permanent: true,
      },
      {
        source: '/culture-tour',
        destination: '/en/safari/safari',
        permanent: true,
      },
      {
        source: '/DayTrips/Packages/index.html',
        destination: '/en/destinations/day-trips-excursions',
        permanent: true,
      },
      {
        source: '/kilimanjaro-',
        destination: '/en/climbing/Kilimanjaro',
        permanent: true,
      },
      {
        source: '/kilimanjaro-joining-',
        destination: '/en/climbing/Kilimanjaro',
        permanent: true,
      },
      {
        source: '/kilimanjaro-joining-group',
        destination: '/en/climbing/Kilimanjaro',
        permanent: true,
      },
      {
        source: '/safari-2',
        destination: '/en/safari/safari',
        permanent: true,
      },
      {
        source: '/safaris',
        destination: '/en/safari/safari',
        permanent: true,
      },
      {
        source: '/trekking-walking',
        destination: '/en/climbing/Kilimanjaro',
        permanent: true,
      },
      {
        source: '/Climbing/Kenya/Packages/5DaysKenya.html',
        destination: '/en/climbing/mount-kenya/5-days-mount-kenya-climb',
        permanent: true,
      },
      {
        source: '/Climbing/Meru/index.html',
        destination: '/en/climbing/meru',
        permanent: true,
      },
      {
        source: '/Destinations/GorillaHike/index.html',
        destination: '/en/destinations/gorilla-hike',
        permanent: true,
      },
      {
        source: '/Destinations/Zanzibar/Packages/5Day.html',
        destination: '/en/destinations/zanzibar-beach-holidays/5-day-zanzibar-holiday',
        permanent: true,
      },
      {
        source: '/Destinations/Zanzibar/Packages/6Day.html',
        destination: '/en/destinations/zanzibar-beach-holidays/5-day-zanzibar-holiday',
        permanent: true,
      },
      {
        source: '/Destinations/Zanzibar/Packages/7Day.html',
        destination: '/en/destinations/zanzibar-beach-holidays/7-day-zanzibar-beach-vacation',
        permanent: true,
      },
      {
        source: '/FAQs.html',
        destination: '/en',
        permanent: true,
      },
      {
        source: '/Footer/OurServices/Sustainability.html',
        destination: '/en/services',
        permanent: true,
      },
      {
        source: '/Safari/Packages/3DayNgo-Ser.html',
        destination: '/en/safari/safari/5-days-safari-expedition',
        permanent: true,
      },
      {
        source: '/Safari/Packages/4DayTar-Ngo-Ser.html',
        destination: '/en/safari/safari/4-days-wildlife-safari',
        permanent: true,
      },
      {
        source: '/Safari/Packages/7DayCalvingMigration.html',
        destination: '/en/safari/safari',
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
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'development-habari.habariadventure.com',
        pathname: '/uploads/**',
      }
    ],
  },
};

export default nextConfig;