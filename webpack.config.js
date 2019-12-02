const path = require("path");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackMultiBuildPlugin = require("html-webpack-multi-build-plugin");
const ExtractCssChunks = require("extract-css-chunks-webpack-plugin");
const postcssPresetEnv = require("postcss-preset-env");
const cssnano = require("cssnano");
const webpack = require("webpack");
const ImageminPlugin = require("imagemin-webpack");
const gifsicle = require("imagemin-gifsicle");
const mozjpeg = require("imagemin-mozjpeg");
const advpng = require("imagemin-advpng");
const svgo = require("imagemin-svgo");

const configFileES5 = path.join(__dirname, "babel.config-es5.js");
const configFileES6 = path.join(__dirname, "babel.config.js");

const css = {
  test: /\.scss$/,
  use: [
    {
      loader: ExtractCssChunks.loader
    },
    {
      loader: "css-loader"
    }
  ]
};
const rules = [
  css,
  {
    test: /\.pug$/,
    use: [{ loader: "pug-loader", options: { pretty: true } }]
  },
  {
    test: /\.(png|svg|jpe?g|gif)$/,
    use: ["file-loader?name=[name].[ext]&outputPath=images/"]
  },
  {
    test: /\.(woff|woff2|eot|ttf|otf)$/,
    use: ["file-loader?name=[name].[ext]&outputPath=fonts/"]
  }
];
const devServer = {
  contentBase: path.join(__dirname, "dist"),
  port: 8080,
  watchContentBase: true,
  watchOptions: {
    ignored: /node_modules/
  }
};
const optimization = {
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
};
const configES5 = {
  entry: path.join(__dirname, "src", "js7", "index.js"),
  module: {
    rules: [
      {
        test: /\.m?js$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              configFile: configFileES5
            }
          }
        ],
        exclude: /node_modules/
      },
      ...rules
    ]
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist")
  },
  optimization
};
const configES6 = {
  entry: path.join(__dirname, "src", "js7", "index.js"),
  module: {
    rules: [
      {
        test: /\.m?js$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              configFile: configFileES6
            }
          }
        ],
        exclude: /node_modules/
      },
      ...rules
    ]
  },
  output: {
    filename: "[name].mjs",
    path: path.resolve(__dirname, "dist")
  },
  optimization
};
module.exports = function(env, argv) {
  if (argv.mode == "production" || !argv.mode) {
    const plugins = [
      new ExtractCssChunks({
        filename: "[name].[contenthash].css"
      }),
      new ImageminPlugin({
        imageminOptions: {
          plugins: [
            gifsicle({ interlaced: true }),
            mozjpeg({ quality: 65 }),
            advpng(),
            svgo({ removeViewBox: true })
          ]
        }
      }),
      new webpack.HashedModuleIdsPlugin()
    ];
    css.use.push(
      {
        loader: "postcss-loader",
        options: { plugins: [postcssPresetEnv(), cssnano] }
      },
      "group-css-media-queries-loader",
      "sass-loader"
    );
    configES5.plugins = [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        filename: "index.html",
        inject: false,
        template: path.join(__dirname, "src", "pug", "index.pug")
      }),
      new HtmlWebpackMultiBuildPlugin(),
      ...plugins
    ];
    configES5.output.filename = "[name]_legacy.[contenthash].js";
    configES6.output.filename = "[name].[contenthash].mjs";
    if (argv.mode) {
      configES6.plugins = plugins;
      return [configES5, configES6];
    } else {
      configES6.plugins = [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
          filename: "index.html",
          inject: false,
          template: path.join(__dirname, "src", "pug", "index.pug")
        }),
        ...plugins
      ];
      return configES6;
    }
  } else if (argv.mode == "development") {
    if (argv.hot) {
      css.use[0].options = {
        hot: true
      };
    }
    css.use[1].options = {
      sourceMap: true
    };
    css.use.push({
      loader: "sass-loader",
      options: {
        sourceMap: true
      }
    });
    configES6.devtool = "cheap-module-source-map";
    configES6.devServer = devServer;
    configES6.plugins = [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        filename: "index.html",
        inject: false,
        template: path.join(__dirname, "src", "pug", "index.pug")
      }),
      new ExtractCssChunks({
        filename: "[name].css"
      })
    ];
    return configES6;
  }
};
