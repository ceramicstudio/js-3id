const path = require('path')
const webpack = require('webpack')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

module.exports = (env, argv) => {
  let config
  if (argv.mode === 'production') {
    if (env.CERAMIC_ENV === 'develop') {
      // develop, develop branch
      config = {
        CERAMIC_API: JSON.stringify('https://ceramic-private-dev.3boxlabs.com'),
        CONNECT_IFRAME_URL: JSON.stringify('https://app-dev.3idconnect.org'),
        MIGRATION: JSON.stringify('true'),
      }
    } else if (env.CERAMIC_ENV === 'clay') {
      config = {
        CERAMIC_API: JSON.stringify('https://ceramic-private-clay.3boxlabs.com'),
        CONNECT_IFRAME_URL: JSON.stringify('https://app-clay.3idconnect.org'),
        VERIFICATION_SERVICE: JSON.stringify('https://verifications-clay.3boxlabs.com'),
        MIGRATION: JSON.stringify('true'),
      }
    } else if (env.CERAMIC_ENV === 'test') {
      config = {
        CERAMIC_API: JSON.stringify(process.env.CERAMIC_API || 'http://localhost:7777'),
        CONNECT_MANAGE_URL: JSON.stringify('http://localhost:30001/management'),
        MIGRATION: JSON.stringify('true'),
      }
    } else {
      //production, main branch, default this so that npm releases dont accidently configure differently
      config = {
        CERAMIC_API: JSON.stringify('https://ceramic-private.3boxlabs.com'),
        CONNECT_IFRAME_URL: JSON.stringify('https://app.3idconnect.org'),
        VERIFICATION_SERVICE: JSON.stringify('https://verifications.3boxlabs.com'),
        MIGRATION: JSON.stringify('true'),
      }
    }
  }

  if (argv.mode === 'development') {
    config = {
      CERAMIC_API: JSON.stringify(process.env.CERAMIC_API || 'http://localhost:7007'),
      CONNECT_MANAGE_URL: JSON.stringify('http://localhost:30001/management'),
      MIGRATION: JSON.stringify('true'),
    }
  }

  const plugins = [
    new webpack.DefinePlugin({ 'process.env': config }),
    new webpack.ProvidePlugin({ Buffer: ['buffer', 'Buffer'] }),
  ]
  if (process.env.ANALYZE) {
    plugins.push(new BundleAnalyzerPlugin())
  }

  return {
    entry: path.resolve(__dirname, 'src', 'index.ts'),
    output: {
      filename: 'index.js',
      path: path.resolve(__dirname, '..', '..', 'public'),
      libraryTarget: 'umd',
      umdNamedDefine: true,
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.(j|t)s$/,
          exclude: /(node_modules)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-typescript'],
              plugins: [
                ['@babel/plugin-transform-runtime', { regenerator: true }],
                '@babel/plugin-proposal-class-properties',
                '@babel/plugin-proposal-object-rest-spread',
              ],
            },
          },
        },
        {
          test: /\.scss$/,
          use: [
            { loader: 'style-loader' },
            {
              loader: 'css-loader',
              options: {
                sourceMap: true,
                modules: {
                  localIdentName: '[local]',
                },
              },
            },
            { loader: 'sass-loader' },
          ],
        },
        {
          test: /\.(png|woff|woff2|eot|ttf)$/,
          loader: 'url-loader',
        },
        {
          test: /\.svg$/,
          loader: 'svg-inline-loader',
        },
      ],
    },
    plugins,
  }
}
