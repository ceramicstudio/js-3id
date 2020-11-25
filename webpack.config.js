const path = require('path')

const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

const plugins = []
if (process.env.ANALYZE) {
  plugins.push(new BundleAnalyzerPlugin())
}

module.exports = {
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
