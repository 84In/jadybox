import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Avatar tài khoản Google SSO
      },
    ],
  },
  allowedDevOrigins: ["192.168.*.*", "localhost"],
};

export default nextConfig;