const path = require('path');

module.exports = {
  configureWebpack: {
    target: 'electron-renderer',
  },

  transpileDependencies: ['vuetify'],
  outputDir: path.join(__dirname, 'build'),
  publicPath: './'
};
