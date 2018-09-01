const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: __dirname + '/front/js/app.jsx',
  output: {
    path: __dirname + '/www/js',
    publicPath: '/www/',
    filename: 'bundle.js',
  },
  resolve: {
    modules: [path.join(__dirname, 'front/js'), 'node_modules'],
    extensions: ['.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /(\.js$|\.jsx$)/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  plugins: [],
};
