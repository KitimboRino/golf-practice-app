/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa")({
  dest: "public",
  register: false, // registered manually in components/RegisterSW.tsx (app-router safe)
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig = {
  reactStrictMode: true,
};

module.exports = withPWA(nextConfig);
