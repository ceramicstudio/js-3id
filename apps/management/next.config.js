const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
const withPlugins = require('next-compose-plugins')
const withImages = require('next-images')

const nextConfig = {
  basePath: '/management',
  future: { webpack5: true },
  reactStrictMode: true,
}

module.exports = withPlugins([[withBundleAnalyzer({})], nextConfig, withImages])
