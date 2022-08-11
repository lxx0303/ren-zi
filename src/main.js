import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
// import locale from 'element-ui/lib/locale/lang/en' // lang i18n

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'

import '@/icons' // icon
import '@/permission' // permission control

import * as directives from '@/directives/index'

import Print from 'vue-print-nb'

Vue.use(Print)

import Component from '@/components'
Vue.use(Component) // 注册自己的插件

import ScreenFull from '@/components/ScreenFull'
Vue.component('ScreenFull', ScreenFull) // 注册全屏组件

import * as filters from '@/filters' // 引入工具类
// 注册全局的过滤器
Object.keys(filters).forEach((key) => {
  // 注册过滤器
  Vue.filter(key, filters[key])
})

console.log(directives)
for (const key in directives) {
  Vue.directive(key, directives[key])
}
import locale from 'element-ui/lib/locale/lang/en' // lang i18n  // 删除这一句
// set ElementUI lang to EN
Vue.use(ElementUI, { locale })
// 如果想要中文版 element-ui，按如下方式声明
// Vue.use(ElementUI)

import i18n from './lang'
// 设置element为当前的语言
Vue.use(ElementUI, {
  i18n: (key, value) => i18n.t(key, value)
})

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  i18n,
  render: (h) => h(App)
})
