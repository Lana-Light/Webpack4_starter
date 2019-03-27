const path = require("path");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtractCssChunks = require("extract-css-chunks-webpack-plugin");
const postcssPresetEnv = require("postcss-preset-env");
const cssnano = require("cssnano");
const webpack = require("webpack");
const ImageminPlugin = require("imagemin-webpack");
const gifsicle = require("imagemin-gifsicle");
const mozjpeg = require("imagemin-mozjpeg");
const advpng = require("imagemin-advpng");
const svgo = require("imagemin-svgo");

let css = {
  test: /\.scss$/,
  use: [
    ExtractCssChunks.loader,
    "css-loader"
  ]
};
let devServer = {
  contentBase: path.join(__dirname, "dist"),
  port: 8080,
  watchContentBase: true,
  watchOptions: {
    ignored: /node_modules/
  }
};
let common = {
  entry: path.join(__dirname, "src", "js7", "index.js"),
  module: {
    rules: [
      {
        test: /\.js$/,
        use: "babel-loader",
        exclude: /node_modules/
      },
      css,
      {
        test: /\.pug$/,
        use: ["html-loader", "pug-html-loader"]
      },
      {
        test: /\.(png|svg|jpe?g|gif)$/,
        use: ["file-loader?name=[name].[ext]&outputPath=images/"]
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: ["file-loader?name=[name].[ext]&outputPath=fonts/"]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: path.join(__dirname, "src", "pug", "index.pug") // + "/pug/index.pug"
    }),
    new ExtractCssChunks({
      filename: "[name].[contenthash].css"
    }),
    new webpack.HashedModuleIdsPlugin()
  ],
  output: {
    filename: "[name].[contenthash].js",
    path: path.resolve(__dirname, "dist")
  },
  optimization: {
    runtimeChunk: "single",
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all"
        }
      }
    }
  }
};
module.exports = function(env, argv) {
  if (argv.mode == "production") {
    css.use.push(
      {
        loader: "postcss-loader",
        options: { plugins: [postcssPresetEnv(), cssnano] }
      },
      "sass-loader"
    );
    common.plugins.push(
      new ImageminPlugin({
        imageminOptions: {
          plugins: [
            gifsicle({ interlaced: true }),
            mozjpeg({ quality: 65 }),
            advpng(),
            svgo({ removeViewBox: true })
          ]
        }
      })
    );
  } else if (argv.mode == "development") {
    css.use.push("sass-loader");
    common.devtool = "cheap-module-eval-source-map";
    common.devServer = devServer;
  }
  return common;
};