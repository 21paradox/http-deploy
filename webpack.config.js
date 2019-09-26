const path = require('path');
const webpack = require('webpack');

const config = {
  entry: path.join(__dirname, './agent.js'),
  target: 'node',
  optimization: {
    // We no not want to minimize our code.
    minimize: false,
  },
  externals: {

  },
  module: {

  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'agent.js',
  },
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
  ],
};

module.exports = config;
