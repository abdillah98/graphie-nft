/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'graphieipfs.infura-ipfs.io'
    ]
  },
  optimizeFonts: false
}

module.exports = nextConfig