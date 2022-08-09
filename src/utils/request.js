import router from '@/router'
import store from '@/store'
import axios from 'axios'
import { Message } from 'element-ui'
import { getTime } from './auth'

const request = axios.create({
  baseURL: process.env.VUE_APP_BASE_API
}) // 创建axios实例

// token超时的时间
const timeOut = 600000000

function isCheckTime() {
  return Date.now() - getTime() < timeOut
}

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const token = store.getters.token
    if (token) {
      if (isCheckTime()) {
        config.headers.Authorization = `Bearer ${token}`
      } else {
        Message.error('登录过期，请重新登录')
        store.dispatch('user/logOut')
        router.push('/')
        return Promise.reject('')
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    console.log(response)
    const {
      data: { success, data, message }
    } = response
    console.log(message)
    if (success) {
      return data
    }
    // 如果代码走到这里，证明success不存在  >>>>  接口请求有问题
    // 进行错误提示
    Message.error(message || '系统错误')
    // 失败的promise  >>>  接口请求的地方报错
    return Promise.reject(message || '系统错误')
  },
  (error) => {
    if (error.response.status === 401) {
      // 退出登录
      store.dispatch('user/logOut')
      router.push('/[]]')
    }
    Message.error(error.response?.data?.message || '系统错误')
    return Promise.reject(error)
  }
)

export default request
