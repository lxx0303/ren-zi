import { login, getUserInfo, getUserDetailById } from '@/api/user'
import { setToken, getToken, removeToken, setTime } from '@/utils/auth'

const state = {
  token: getToken(), // 设置token初始状态   token持久化 => 放到缓存中
  userInfo: {} // 定义一个空的对象 不是null 因为后边我要开发userInfo的属性给别人用  userInfo.name
}

const mutations = {
  // 修改token的方法
  setToken(state, token) {
    state.token = token // 修改了vuex的状态
    setToken(token)
  },
  removeToken(state) {
    state.token = null
    removeToken()
  },
  setUserInfo(state, userInfo) {
    state.userInfo = userInfo
  },
  removeUserInfo(state) {
    state.userInfo = {}
  }
}

const actions = {
  // 登录请求   >>>  commit   >>>mutations
  async login(context, data) {
    const res = await login(data)
    console.log(res)
    setTime()
    // 获取到的token存储vuex/cookie
    context.commit('setToken', res)
  },
  // 获取用户资料action
  async getUserInfo(context) {
    const res = await getUserInfo() // 获取返回值
    const baseInfo = await getUserDetailById(res.userId)
    context.commit('setUserInfo', { ...res, ...baseInfo }) // 将整个的个人信息设置到用户的vuex数据中
    // return result // 这里为什么要返回 为后面埋下伏笔
  },
  logOut(context) {
    context.commit('removeUserInfo')
    context.commit('removeToken')
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
