import path from "path";
import { Configuration as WebpackConfiguration, HotModuleReplacementPlugin, ProvidePlugin } from "webpack";
import { Configuration as WebpackDevServerConfiguration } from "webpack-dev-server";
import HtmlWebpackPlugin from "html-webpack-plugin";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import FaviconsWebpackPlugin from "favicons-webpack-plugin";
import ESLintPlugin from "eslint-webpack-plugin";
import NodePolyfillPlugin from "node-polyfill-webpack-plugin";

interface Configuration extends WebpackConfiguration {
  devServer?: WebpackDevServerConfiguration;
}

const config: Configuration = {
  mode: "development",
  target: "web",
  output: {
    publicPath: "/",
  },
  entry: "./app/index.tsx",
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/i,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react", "@babel/preset-typescript"],
          },
        },
      },
      {
        test: /\.svg/,
        use: {
          loader: "svg-url-loader",
          options: {
            // Inline files smaller than 100 kB
            limit: 100 * 1024,
            // make all svg images to work in IE
            iesafe: true,
          },
        },
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".mjs", ".js", ".json"],
    fallback: {
      fs: false,
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./app/index.html",
    }),
    new HotModuleReplacementPlugin(),
    new NodePolyfillPlugin({}),
    new ForkTsCheckerWebpackPlugin({
      async: false,
    }),
    new FaviconsWebpackPlugin("./app/assets/favicon.svg"),
    new ESLintPlugin({
      extensions: ["js", "jsx", "ts", "tsx"],
    }),
    new ProvidePlugin({
      process: "process/browser",
    }),
  ],
  devtool: "inline-source-map",
  devServer: {
    contentBase: path.join(__dirname, "build"),
    historyApiFallback: true,
    port: 4000,
    open: true,
    hot: true,
  },
};

export default config;
