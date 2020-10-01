const path = require('path');

module.exports = {
  entry: './example/app.js',
  output: {
    filename: 'build.js',
    path: path.resolve(__dirname, './'),
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    rules: [{
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', "@babel/preset-react"],
            plugins: [
              ['@babel/plugin-transform-runtime', {
                'regenerator': true
              }],
              ['@babel/plugin-proposal-object-rest-spread']
            ]
          }
        }
      },
    ]
  },
  node: {
    console: false,
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  }
};
