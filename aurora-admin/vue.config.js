const { defineConfig } = require('@vue/cli-service')
const path = require('path')
function resolve(dir) {
  return path.join(__dirname, dir)
}
module.exports = defineConfig({
  transpileDependencies: true,
  productionSourceMap: false,
  devServer: {
    proxy: {
      '/admin': {
        target: 'http://localhost:3399',
        changeOrigin: true,
        pathRewrite: {
          '^/admin': '/admin'
        }
      }
    }
  },
  chainWebpack: (config) => {
    config.resolve.alias.set('@', resolve('src'))
  }
})
