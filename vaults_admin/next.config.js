const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  ...nextConfig,
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  serverDependencies: [
    '@rainbow-me/rainbowkit',
    '@rainbow-me/rainbowkit/wallets',
  ],
}