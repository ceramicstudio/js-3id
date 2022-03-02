const path = require('path')
const webpack = require('webpack')

const LOCAL_URL = 'http://localhost:30001/v2'

module.exports = {
  entry: './src/app.ts',
  output: {
    filename: 'build.js',
    path: path.resolve(__dirname, './dist'),
    libraryTarget: 'umd',
    umdNamedDefine: true,
  },
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
      crypto: false,
      http: false,
      https: false,
      os: false,
      stream: false,
    },
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
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        CONNECT_IFRAME_URL: JSON.stringify(LOCAL_URL),
        CONNECT_MANAGE_URL: JSON.stringify(`${LOCAL_URL}/management`),
      },
    }),
    new webpack.ProvidePlugin({ Buffer: ['buffer', 'Buffer'] }),
  ],
}
