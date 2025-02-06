const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
})

/** @type {import('next').NextConfig} */
const nextConfig = {
 /* config options here */
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
eslint: {
  // Warning: This allows production builds to successfully complete even if
  // your project has ESLint errors.
  ignoreDuringBuilds: true,
},
}

module.exports = withPWA(nextConfig)
