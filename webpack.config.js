const path = require('path');
const webpack = require('webpack')
const nodeExternals = require('webpack-node-externals');

module.exports = {
  context: path.resolve(__dirname, './src'),
  entry: './index.js',
  target: 'node',
  externals: [nodeExternals()],
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: './index.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, './src'),
        loader: 'babel-loader'

      }
    ]
  }
}
