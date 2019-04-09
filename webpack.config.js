const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const express = require('express')

const main = [
  'webpack-dev-server/client?http://localhost:5555',
  'webpack/hot/only-dev-server',
  './src/index.ts'
]

module.exports = {
  context: process.cwd(), // to automatically find tsconfig.json
  entry: {
    main: main
  },
  output: {
    filename: 'bundle.js',
    publicPath: "/"
  },
  optimization: {
    namedModules: true
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new ForkTsCheckerWebpackPlugin({
      tslint: true,
      checkSyntacticErrors: true,
      watch: ['./src'] // optional but improves performance (fewer stat calls)
    }),
    new HtmlWebpackPlugin({
      inject: true,
      template: 'public/index.html'
    })
  ],
  module: {
    rules: [{
      test: /.tsx?$/,
      use: [{
        loader: 'ts-loader',
        options: {
          transpileOnly: true
          // projectReferences: true
        }
      }],
      exclude: path.resolve(process.cwd(), 'node_modules'),
      include: [
        path.resolve(process.cwd(), 'src'),
      ]
    }, {
      test: /\.(jpe?g|png|gif|svg)$/i,
      use: [{
        loader: 'url-loader',
        options: {
          limit: 8192000
        }
      }]
    }]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.png', '.jpg'],
    alias: {
      '~/': path.join(process.cwd(), 'src')
    },
    plugins: [
    ]
  },
  devtool: 'inline-source-map',
  devServer: {
    host: 'localhost',
    port: 5555,
    open: false,
    hot: false,
    historyApiFallback: true,
    stats: 'errors-only',
    disableHostCheck: true,
    contentBase: path.resolve(process.cwd(), 'public'),
    publicPath: '/'
  }
}
