// /** @type {import('next').NextConfig} */
// const nextConfig = {
//     images: {
//         domains: ['stimg.cardekho.com','imgd.aeplcdn.com','media.ed.edmunds-media.com',] // Add the hostname here
//       },
//       // other configurations if any
// };

// export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
      domains: ['stimg.cardekho.com', 'imgd.aeplcdn.com', 'media.ed.edmunds-media.com', 'localhost'], // Added 'localhost'
      remotePatterns: [
          {
              protocol: 'http',
              hostname: 'localhost',
              port: '9000', // Specify the port
              pathname: '/carrental/**', // Specify the path
          },
      ],
  },
  // other configurations if any
};

export default nextConfig;
