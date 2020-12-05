import merge from "webpack-merge";
import webpack, { Configuration as WebpackConfiguration } from "webpack";
import { Configuration as WebpackDevServerConfiguration } from "webpack-dev-server";
import path from "path";
import DotenvWebpack from "dotenv-webpack";
import common from "./webpack.common";

interface Configuration extends WebpackConfiguration {
  devServer?: WebpackDevServerConfiguration;
}

module.exports = merge(common, {
  mode: "development",
  devtool: "source-map",
  devServer: {
    contentBase: path.resolve(__dirname, "dist"),
    historyApiFallback: true,
    compress: true,
    noInfo: false,
    hot: true,
    host: "127.0.0.1",
    port: 8080,
    index: "index.html"
  },
  stats: "normal",
  output: {
    path: path.resolve(__dirname, "./dist/debug/"),
  },  
  plugins: [
    new DotenvWebpack(),
    new webpack.EnvironmentPlugin({
      NODE_ENV: "development"
    })
  ]
} as Configuration);
