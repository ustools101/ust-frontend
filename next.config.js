const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  images: {
  remotePatterns: [
    {
      // Allow any hostname for HTTPS images.
      protocol: 'https',
      hostname: '**',
    }
  ],
},
typescript: {
  // !! WARN !!
  // Dangerously allow production builds to successfully complete even if
  // your project has type errors.
  ignoreBuildErrors: true,
},
}

module.exports = withPWA(nextConfig)
