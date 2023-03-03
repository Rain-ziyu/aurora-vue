// cancel-request.js   解决重复请求导致的数据覆盖
import qs from 'qs'
export default class CancelRequest {
  pendingRequest 
  constructor() {
    this.pendingRequest = new Map()
  }
  // 根据请求信息生成唯一标识key   实际上并不匹配目前的目的   后端还是调用两次，对于保存更新等操作没有意义 对于search接口来说参数又是每次都在变化
  geterateReqKey(config:any) {
    const { url,params, method, data } = config
    return [url, qs.stringify(params), method, qs.stringify(data)].join('&')
  }
  // 把当前请求信息添加到pendingRequest对象中
  addPendingRequest(config :any, CancelToken:any) {
    const requestKey = this.geterateReqKey(config)
    config.cancelToken =
      config.cancelToken ||
      new CancelToken((cancel: any)=> {
        if (!this.pendingRequest.has(requestKey)) {
          // 把请求取消方法作为 map 值存起来
          this.pendingRequest.set(requestKey, cancel)
        }
      })
  }
  // 检查是否存在重复请求，若存在则取消前一次请求
  removePendingRequest(config:any) {
    const requestKey = this.geterateReqKey(config)
    if (this.pendingRequest.has(requestKey)) {
      const cancel = this.pendingRequest.get(requestKey)
      // 取消请求
      cancel(requestKey)
      // 删除map中对应的属性
      this.removeRequestKey(config)
    }
  }
  // 从pendingRequest中删除对应的key
  removeRequestKey(config:any) {
    const requestKey = this.geterateReqKey(config)
    this.pendingRequest.delete(requestKey)
  }
}