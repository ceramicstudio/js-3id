const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
const withPlugins = require('next-compose-plugins')
const withImages = require('next-images')

const nextConfig = {
  future: { webpack5: true },
  webpack: (config) => {
    config.resolve.fallback = { 
      fs: false, 
      path: false, 
      http: false, 
      https: false, 
      os: false, 
      stream: false,
      crypto: false,
      assert: false
    }
    return config
  },
  reactStrictMode: true,
  basePath: '/v1',
}

module.exports = withPlugins([[withBundleAnalyzer({})], nextConfig, withImages])
