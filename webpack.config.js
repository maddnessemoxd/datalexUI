var webpack = require('webpack');
var path = require('path');
var autoprefixer = require('autoprefixer');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  entry: {
    app: "./js/app.js",
    sequences: "./js/sequences.js"
  },
  output: {
    path: path.resolve('dist'),
    publicPath: 'dist',
    filename: '[name].bundle.js'
  },

  devtool: 'source-map',

  plugins: [
    new ExtractTextPlugin("css/bundle.css"),
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery"
    })
  ],
  module: {
    loaders: [

      {
        test: /\.html$/,
        loader: 'html?attrs=false'
      },

      {
        test: /\.less$/,
        loader: ExtractTextPlugin.extract("style-loader", "css-loader!less-loader")
      },

      {
        test: /\.(jpe?g|png|gif)$/i,
        loader: 'file?name=./img/[name].[ext]'
      },

      {
        test: /\.(woff|woff(2)?|eot|ttf|svg)$/,
        loader: 'file?name=./[name].[ext]'
      },

      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract('style-loader', 'css-loader', {
          publicPath: './'
        })
      }

    ]
  },
  postcss: function() {
    return [autoprefixer({
      browsers: ['last 2 versions']
    })];
  }
};