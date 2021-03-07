/* eslint-disable */
const CircularDependencyPlugin = require('circular-dependency-plugin');

module.exports = {
  publicPath: './',
  lintOnSave: false,
  transpileDependencies: ['vuetify'],
  configureWebpack: {
    devtool: 'source-map',
    devServer: {
      open: true
    },
    plugins: [
      new CircularDependencyPlugin({
        // exclude detection of files based on a RegExp
        exclude: /a\.js|node_modules/,
        // add errors to webpack instead of warnings
        failOnError: true,
        // allow import cycles that include an asyncronous import,
        // e.g. via import(/* webpackMode: "weak" */ './file.js')
        allowAsyncCycles: false,
        // set the current working directory for displaying module paths
        cwd: process.cwd()
      })
    ]
  }
};
