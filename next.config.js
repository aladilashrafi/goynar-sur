const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ibb.co' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'goynarsur.com' },
      { protocol: 'https', hostname: 'www.goynarsur.com' },
      { protocol: 'https', hostname: 'cms.goynarsur.com' },
      { protocol: 'https', hostname: 'cms.omegamartbd.com' },
      { protocol: 'https', hostname: 'secure.gravatar.com' },
    ],
  },
}

module.exports = nextConfig
