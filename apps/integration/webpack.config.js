const path = require('path')
const webpack = require('webpack')

module.exports = {
  entry: path.resolve(__dirname, 'app.ts'),
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, './public/build'),
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
    ],
  },
  plugins: [new webpack.DefinePlugin({ 'process.env': {} })],
}
