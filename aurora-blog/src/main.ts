import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './router/guard'
import '@/styles/index.scss'
import 'normalize.css/normalize.css'
import { createPinia } from 'pinia'
import { i18n } from './locales'
import VueClickAway from 'vue3-click-away'
import lazyPlugin from 'vue3-lazy'
import { registerSvgIcon } from '@/icons'
import { registerObSkeleton } from '@/components/LoadingSkeleton'
import 'prismjs/themes/prism.css'
import 'prismjs'
// 引入MD编辑器
import mavonEditor from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'
import 'element-plus/theme-chalk/index.css'
import { components, plugins } from './plugins/element-plus'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import infiniteScroll from 'vue3-infinite-scroll-better'
import v3ImgPreview from 'v3-img-preview'
import api from './api/api'
// 全局引入Element  单独引入table一直不能用 我放弃了
import ElementPlus from 'element-plus'
// 设置element为中文
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import dayjs from 'dayjs'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
export const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.use(mavonEditor)
app.config.globalProperties.$moment=dayjs
app
  .use(router)
  .use(ElementPlus,{
    locale: zhCn,
  })
  .use(pinia)
  .use(i18n)
  .use(VueClickAway)
  .use(infiniteScroll)
  .use(v3ImgPreview, {})
  .use(lazyPlugin, {
    loading: require('@/assets/default-cover.jpg'),
    error: require('@/assets/default-cover.jpg')
  })
  

// components.forEach((component) => {
//   app.component(component.name, component)
// })
// plugins.forEach((plugin) => {
//   app.use(plugin)
// })
registerSvgIcon(app)
registerObSkeleton(app)
app.mount('#app')

api.report()
