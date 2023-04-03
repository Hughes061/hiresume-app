/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["randomuser.me", "images.unsplash.com", "cloudflare-ipfs.com"],
  },
};

module.exports = nextConfig;
