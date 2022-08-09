// vuex的权限模块
import { constantRoutes, asyncRoutes, resetRouter } from '@/router'
import { getUserInfo, getUserDeatiById } from '@/api/user'
// vuex中的permission模块用来存放当前的 静态路由 + 当前用户的 权限路由
const state = {
  routes: constantRoutes // 所有人默认拥有静态路由
}
const mutations = {
  // newRoutes可以认为是 用户登录 通过权限所得到的动态路由的部分
  setRoutes(state, newRoutes) {
    // 下面这么写不对 不是语法不对 是业务不对
    // state.routes = [...state.routes, ...newRoutes]
    // 有一种情况  张三 登录 获取了动态路由 追加到路由上  李四登录 4个动态路由
    // 应该是每次更新 都应该在静态路由的基础上进行追加
    state.routes = [...constantRoutes, ...newRoutes]
  }
}
const actions = {
  // 筛选权限路由
  // 第二个参数为当前用户的所拥有的菜单权限
  // menus: ["settings","permissions"]
  // asyncRoutes是所有的动态路由
  // asyncRoutes  [{path: 'setting',name: 'setting'},{}]
  async filterRoutes(context, menus) {
    //   筛选出 动态路由中和menus中能够对上的路由
    const resRoutes = asyncRoutes.filter((item) => {
      return menus.includes(item.name)
    })
    // 得到的routes是所有模块中满足权限要求的路由数组
    // routes就是当前用户所拥有的 动态路由的权限
    context.commit('setRoutes', resRoutes) // 将动态路由提交给mutations
    // 这里为什么还要return  state数据 是用来 显示左侧菜单用的  return  是给路由addRoutes用的
    const res = await getUserInfo()
    const baseInfo = await getUserDeatiById(res.userId)
    return {
      ...baseInfo,
      ...res
    }
  },
  logOut(context) {
    context.commit('removeToken')
    context.commit('removeUserInfo')
    resetRouter()
    context.commit('permission/setRoutes', [], { root: true })
  }
}
export default {
  namespaced: true,
  state,
  mutations,
  actions
}
