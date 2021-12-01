const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
const withPlugins = require('next-compose-plugins')
const withImages = require('next-images')

const nextConfig = {
  future: { webpack5: true },
  reactStrictMode: true,
  basePath: '/v1',
}

module.exports = withPlugins([[withBundleAnalyzer({})], nextConfig, withImages])
