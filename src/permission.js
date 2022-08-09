// 处理权限判断

import router from '@/router'
// 引入store仓库  >>>  有token的
import store from '@/store'
import NProgress from 'nprogress' // 引入一份进度条插件
import 'nprogress/nprogress.css' // 引入进度条样式

const loginPath = '/login'
const notFoundPath = '/404'

const whiteList = [loginPath, notFoundPath]

// 监听路由变化
router.beforeEach(async(to, from, next) => {
  NProgress.start()
  const token = store.getters.token

  if (token) {
    if (!store.getters.token) {
      // 如果说后续 需要根据用户资料获取数据的话 这里必须改成 同步
      // 筛选用户的可用路由
      // actions中函数 默认是Promise对象 调用这个对象 想要获取返回的值话 必须 加 await或者是then
      // actions是做异步操作的
      const { roles } = await store.dispatch('user/getUserInfo')
      const routes = await store.dispatch(
        'permission/filterRoutes',
        roles.menus
      )
      router.addRoutes(
        ...routes,
        // 404 page must be placed at the end !!!
        { path: '*', redirect: '/404', hidden: true }
      )
      next(to.path)
    }
    // 判断是否去登陆页面
    if (to.path === loginPath) {
      next('/') // 跳转首页
    } else {
      // 直接放行
      next()
    }
  } else {
    if (whiteList.includes(to.path)) {
      next()
    } else {
      // 如果你没有token，同时要去的界面不是白名单界面（要去的时有权限的界面）>>>跳转登陆页面
      next(loginPath)
    }
  }
  NProgress.done() // 手动强制关闭一次  为了解决 手动切换地址时  进度条的不关闭的问题
})

// 路由跳转完成后  >>>   关闭进度条
router.afterEach(function() {
  setTimeout(() => {
    NProgress.done() // 关闭进度条
  }, 2000)
})
