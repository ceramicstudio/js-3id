const path = require('path');

module.exports = {
  entry: './iframe/index.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'public'),
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              ['@babel/plugin-transform-runtime', {
                'regenerator': true
              }],
              ['@babel/plugin-proposal-object-rest-spread']
            ]
          }
        }
      },
      {
       test: /\.scss$/,
       use: [
         {
           loader: "css-loader",
           options: {
             sourceMap: true,
             modules: true,
             // localIdentName: "[local]___[hash:base64:5]"
           }
         },
         {
           loader: "sass-loader"
         }
       ]
      }
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
