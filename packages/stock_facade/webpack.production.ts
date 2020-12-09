/* eslint "import/no-extraneous-dependencies": "error" */
import webpack from "webpack";
import path from "path";
import merge from "webpack-merge";
import TerserWebpackPlugin from "terser-webpack-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import DotenvWebpack from "dotenv-webpack";
import common from "./webpack.common";

module.exports = merge(common, {
  mode: "production",
  stats: "minimal",
  performance: {
    hints: false,
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserWebpackPlugin({
        parallel: true,
      }),
      new CssMinimizerPlugin(),
    ],
  },
  output: {
    path: path.resolve(__dirname, "./dist/release/"),
  },  
  plugins: [
    new CleanWebpackPlugin(),
    new DotenvWebpack(),
    new webpack.EnvironmentPlugin({
      NODE_ENV: "production",
    }),
  ],
});
