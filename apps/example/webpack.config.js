const path = require('path')
const webpack = require('webpack')

const plugins = []

const dp = new webpack.DefinePlugin({
  'process.env': {
    CONNECT_IFRAME_URL: JSON.stringify('http://localhost:30001'),
    CONNECT_MANAGE_URL: JSON.stringify('http://localhost:30001/management')
  }
})
plugins.push(dp)

module.exports = {
  entry: './src/app.ts',
  output: {
    filename: 'build.js',
    path: path.resolve(__dirname, './dist'),
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  resolve: {
    extensions: ['.ts', '.js']
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
              '@babel/plugin-proposal-object-rest-spread'
            ]
          }
        }
      }
    ]
  },
  plugins,
  node: {
    console: false,
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  }
}
