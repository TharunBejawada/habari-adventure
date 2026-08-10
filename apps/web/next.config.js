// apps/web/next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // --- Existing Redirects (5) ---
      {
        source: '/Climbing/Kilimanjaro/Packages/8DaysLemosho.html',
        destination: '/climbing/kilimanjaro/8-days-lemosho-route-climb-kosovo',
        permanent: true,
      },
      {
        source: '/Climbing/Kilimanjaro/index.html',
        destination: '/climbing/kilimanjaro',
        permanent: true,
      },
      {
        source: '/Climbing/Kilimanjaro/Packages/7DaysLemosho.html',
        destination: '/climbing/kilimanjaro/7-days-lemosho-route-climb',
        permanent: true,
      },
      {
        source: '/Safari/index.html',
        destination: '/safari/safari',
        permanent: true,
      },
      {
        source: '/About/AboutUs.html',
        destination: '/about',
        permanent: true,
      },

      // --- New Unique Redirects (30) ---
      {
        source: '/About/Whychooseus.html',
        destination: '/about',
        permanent: true,
      },
      {
        source: '/Climbing/Kenya/index.html',
        destination: '/climbing/mount-kenya',
        permanent: true,
      },
      {
        source: '/Climbing/Kilimanjaro/Packages/7DaysRongai.html',
        destination: '/climbing/kilimanjaro/7-days-lemosho-route-climb',
        permanent: true,
      },
      {
        source: '/ContactUs.html',
        destination: '/contact',
        permanent: true,
      },
      {
        source: '/Footer/Company/OurServices.html',
        destination: '/services',
        permanent: true,
      },
      {
        source: '/index.html',
        destination: '/',
        permanent: true,
      },
      {
        source: '/SiteLayout/footer.html',
        destination: '/',
        permanent: true,
      },
      {
        source: '/2021-travel-dates',
        destination: '/',
        permanent: true,
      },
      {
        source: '/7-days-machame-route',
        destination: '/climbing/machame-route/7-days-machame-route',
        permanent: true,
      },
      {
        source: '/About/Crew.html',
        destination: '/crew',
        permanent: true,
      },
      {
        source: '/culture-tour',
        destination: '/safari/safari',
        permanent: true,
      },
      {
        source: '/DayTrips/Packages/index.html',
        destination: '/destinations/day-trips-excursions',
        permanent: true,
      },
      {
        source: '/kilimanjaro-',
        destination: '/climbing/Kilimanjaro',
        permanent: true,
      },
      {
        source: '/kilimanjaro-joining-',
        destination: '/climbing/Kilimanjaro',
        permanent: true,
      },
      {
        source: '/kilimanjaro-joining-group',
        destination: '/climbing/Kilimanjaro',
        permanent: true,
      },
      {
        source: '/safari-2',
        destination: '/safari/safari',
        permanent: true,
      },
      {
        source: '/safaris',
        destination: '/safari/safari',
        permanent: true,
      },
      {
        source: '/trekking-walking',
        destination: '/climbing/Kilimanjaro',
        permanent: true,
      },
      {
        source: '/Climbing/Kenya/Packages/5DaysKenya.html',
        destination: '/climbing/mount-kenya/5-days-mount-kenya-climb',
        permanent: true,
      },
      {
        source: '/Climbing/Meru/index.html',
        destination: '/climbing/meru',
        permanent: true,
      },
      {
        source: '/Destinations/GorillaHike/index.html',
        destination: '/destinations/gorilla-hike',
        permanent: true,
      },
      {
        source: '/Destinations/Zanzibar/Packages/5Day.html',
        destination: '/destinations/zanzibar-beach-holidays/5-day-zanzibar-holiday',
        permanent: true,
      },
      {
        source: '/Destinations/Zanzibar/Packages/6Day.html',
        destination: '/destinations/zanzibar-beach-holidays/5-day-zanzibar-holiday',
        permanent: true,
      },
      {
        source: '/Destinations/Zanzibar/Packages/7Day.html',
        destination: '/destinations/zanzibar-beach-holidays/7-day-zanzibar-beach-vacation',
        permanent: true,
      },
      {
        source: '/FAQs.html',
        destination: '/',
        permanent: true,
      },
      {
        source: '/Footer/OurServices/Sustainability.html',
        destination: '/services',
        permanent: true,
      },
      {
        source: '/Safari/Packages/3DayNgo-Ser.html',
        destination: '/safari/safari/5-days-safari-expedition',
        permanent: true,
      },
      {
        source: '/Safari/Packages/4DayTar-Ngo-Ser.html',
        destination: '/safari/safari/4-days-wildlife-safari',
        permanent: true,
      },
      {
        source: '/Safari/Packages/7DayCalvingMigration.html',
        destination: '/safari/safari',
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