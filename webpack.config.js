const path = require('path')
const webpack = require('webpack')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

const plugins = []
if (process.env.ANALYZE) {
  plugins.push(new BundleAnalyzerPlugin())
}

module.exports = (env, argv) => {
  if (argv.mode === 'production') {
    const dp = new webpack.DefinePlugin({
      'process.env': {
        'CERAMIC_API': JSON.stringify('https://ceramic-dev.3boxlabs.com'),
        'CONNECT_IFRAME_URL': JSON.stringify('https://app.3idconnect.org')
      }
    })
    plugins.push(dp)
  }
  
  if (argv.mode=== 'development') {
    const dp = new webpack.DefinePlugin({
      'process.env': {
        'CERAMIC_API': JSON.stringify(process.env.CERAMIC_API || 'http://localhost:7007'),
        'CONNECT_IFRAME_URL': JSON.stringify('http://localhost:30001')
      }
    })
    plugins.push(dp)
  }

  return  {
    entry: './iframe/index.ts',
    output: {
      filename: 'index.js',
      path: path.resolve(__dirname, 'public'),
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
            {
              loader: 'css-loader',
              options: {
                sourceMap: true,
                modules: true,
                localIdentName: '[local]',
              },
            },
            {
              loader: 'sass-loader',
            },
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
    node: {
      console: false,
      fs: 'empty',
      net: 'empty',
      tls: 'empty',
      child_process: 'empty',
    },
  }
}
