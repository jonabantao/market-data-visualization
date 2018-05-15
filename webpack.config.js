var path = require('path');
var webpack = require('webpack');

module.exports = {
  context: __dirname,
  entry: {
    "bundle": "./src/index.js",
    "bundle.min": "./src/index.js",
  },
  output: {
    path: path.resolve(__dirname, "src"),
    filename: "[name].js"
  },
  module: {
    loaders: [{
      test: [/\.js?$/],
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: {
        presets: ['env']
      }
    }]
  },
  devtool: 'source-map',
  resolve: {
    extensions: [".js", '*']
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      include: /\.min\.js$/,
      minimize: true
    })
  ]
};