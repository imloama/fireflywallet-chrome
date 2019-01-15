const webpack = require('webpack');
const ejs = require('ejs');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WebpackShellPlugin = require('webpack-shell-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ChromeExtensionReloader = require('webpack-chrome-extension-reloader');
const { VueLoaderPlugin } = require('vue-loader');
const { version } = require('../package.json');
var path = require('path');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

const root = path.resolve(__dirname,'..')

const config = {
  mode: process.env.NODE_ENV,
  node:{
    fs: "empty"
  },
  entry: {
    'background': path.resolve(__dirname,'../src/background.js'),
    'chromereload': path.resolve(__dirname,'../src/chromereload.js'),
    'app':path.resolve(__dirname,'../src/main.js'),
    "ffw":path.resolve(__dirname,'../src/ffw/ffw.js')
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'js/[name].js',
  },
  resolve: {
    extensions: ['.js', '.json', '.vue','.styl','.stylus'],
    alias: {
        // 'vue$': 'vue/dist/vue.esm.js',
        '@': path.resolve(__dirname,'../src')
    },
    symlinks: false

  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loaders: 'vue-loader',
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.styl$/,
        loaders: ['style-loader', { loader: 'css-loader', options: { minimize: true } }, 'stylus-loader']
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.sass$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader?indentedSyntax'],
      },
      {
        test: /\.(png|jpe?g|gif|svg|ico)$/,
        loader: 'file-loader',
        options: {
          name: 'img/[name].[ext]?emitFile=false',
        },
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'media/[name]--[folder].[ext]'
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        use: {
          loader: 'url-loader',
          query: {
            limit: 10000,
            name: 'fonts/[name]--[folder].[ext]'
          }
        }
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin([path.resolve(__dirname, '../dist')],{root}),
    new VueLoaderPlugin(),
    new webpack.ProgressPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    new HtmlWebpackPlugin({
        excludeChunks: ['background','chromereload','ffw'],
        template: path.resolve(__dirname,'../public/index.html'),
        filename: 'index.html'
    }),
    new CopyWebpackPlugin([
      { from: path.resolve(__dirname,'../src/icons'), to: 'icons' },
      //{ from: 'popup/popup.html', to: 'popup/popup.html', transform: transformHtml },
      //{ from: 'options/options.html', to: 'options/options.html', transform: transformHtml },
    //   { from: 'main/main.html', to: 'index.html', transform: transformHtml },
      {
        from: path.resolve(__dirname,'../src/manifest.json'),
        to: 'manifest.json',
        transform: (content) => {
          const jsonContent = JSON.parse(content);
          jsonContent.version = version;

          if (config.mode === 'development') {
            jsonContent['content_security_policy'] = "script-src 'self' 'unsafe-eval'; object-src 'self'";
          }

          return JSON.stringify(jsonContent, null, 2);
        },
      },
      {from:path.resolve(__dirname,'../src/_locales'), to: '_locales'}
    ]),
    new WebpackShellPlugin({
      onBuildEnd: ['node scripts/remove-evals.js'],
    }),
  ],
};

if (config.mode === 'production') {
  config.plugins = (config.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"',
      },
    }),
  ]);
}

if (process.env.HMR === 'true') {
  config.plugins = (config.plugins || []).concat([
    new ChromeExtensionReloader(),
  ]);
}

function transformHtml(content) {
  return ejs.render(content.toString(), {
    ...process.env,
  });
}

module.exports = config;
