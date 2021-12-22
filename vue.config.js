module.exports = {
  configureWebpack: {
    target: 'electron-renderer',
  },

  transpileDependencies: [
    'vuetify'
  ]
};
