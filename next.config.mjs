/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "newchatapp.s3.amazonaws.com",
        pathname: "/**", // Allows all paths
      },
    ],
  },
};

export default nextConfig;

