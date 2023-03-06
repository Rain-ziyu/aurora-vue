import axios, { CancelToken, CancelTokenSource } from 'axios'
import { app } from '@/main'
import CancelRequest from '@/api/cancel-request'
import { useUserStore } from '@/stores/user';
import api from '@/api/api'
let cancelRequest = new CancelRequest()
const CancelToken = axios.CancelToken;
let previousCancelToken = CancelToken.source();
axios.interceptors.request.use((config: any) => {
  config.headers['token'] = localStorage.getItem('token')
  // 预留之后使用
  config.headers['refreshToken'] = localStorage.getItem('refreshToken')
   // 在请求开始之前检查先前的请求，如果是重复请求，删除之前的
  cancelRequest.removePendingRequest(config);
   // 如果不存在就将当前请求添加到pendingRequest
  cancelRequest.addPendingRequest(config,CancelToken);
  return config
})

axios.interceptors.response.use(
  (response) => {
    
      // 移除成功请求记录
    cancelRequest.removeRequestKey(response.config)
    switch (response.data.result) {
      case 1:
        app.config.globalProperties.$notify({
          title: 'Error',
          message: response.data.message,
          type: 'error'
        })
        break
      case 510:

        // 如果token失效直接移除，之后不携带 同步移除登录的用户信息
        localStorage.removeItem('token')
        useUserStore().userInfo =""
        // 保险起见再进行一次服务端注销   实际上没必须要 如果服务端验证不通过 说明其token本就无效
        // api.logout()
        app.config.globalProperties.$notify({
          title: '提示',
          message: '您以游客身份访问',
          type: 'info'
        })
        break
    }
    return response
  },
  (error) => {
    // 如果token失效,或者出现请求问题直接移除，之后不携带
    localStorage.removeItem('token')
      // 失败时也需要移除
    cancelRequest.removeRequestKey(error.config || {} )
    return Promise.reject(error)
  }
)
export default {  
  getCancelToken: () => {
    return CancelToken.source();
  },
  getPreviousCancelToken: () => {
    return previousCancelToken;
  },
  setCurCancelToken: (cancelToken: CancelTokenSource) => {
     previousCancelToken = cancelToken;
  },
  getTopAndFeaturedArticles: () => {
    return axios.get('/user/articles/topAndFeatured')
  },
  getArticles: (params: any) => {
    return axios.get('/user/articles/all', { params: params })
  },
  getArticlesByCategoryId: (params: any) => {
    return axios.get('/user/articles/categoryId', { params: params })
  },
  getArticeById: (articleId: any) => {
    return axios.get('/user/articles/' + articleId)
  },
  getAllCategories: () => {
    return axios.get('/user/categories/all')
  },
  getAllTags: () => {
    return axios.get('/user/tags/all')
  },
  getTopTenTags: () => {
    return axios.get('/user/tags/topTen')
  },
  getArticlesByTagId: (params: any) => {
    return axios.get('/user/articles/tagId', { params: params })
  },
  getAllArchives: (params: any) => {
    return axios.get('/user/archives/all', { params: params })
  },
  login: (params: any) => {
    return axios.post('/user/login', params)
  },
  getCurrentUserInfo: () => {
    return axios.get('/user/users/info')
  },
  saveComment: (params: any) => {
    return axios.post('/user/comments/save', params)
  },
  getComments: (params: any) => {
    return axios.get('/user/comments', { params: params })
  },
  getTopSixComments: () => {
    return axios.get('/user/comments/topSix')
  },
  getAbout: () => {
    return axios.get('/user/about')
  },
  getFriendLink: () => {
    return axios.get('/user/links')
  },
  submitUserInfo: (params: any) => {
    return axios.put('/user/users/info', params)
  },
  getUserInfoById: (id: any) => {
    return axios.get('/user/users/info/' + id)
  },
  updateUserSubscribe: (params: any) => {
    return axios.put('/user/users/subscribe', params)
  },
  sendValidationCode: (username: any) => {
    return axios.get('/user/users/code', {
      params: {
        username: username
      }
    })
  },
  bindingEmail: (params: any) => {
    return axios.put('/user/users/email', params)
  },
  register: (params: any) => {
    return axios.post('/user/users/register', params)
  },
  searchArticles: (params: any) => {
    // return axios.get('/user/articles/search', {
    //   params: params
    // })
    return axios.get('/user/articles/search', 
       params
    )
  },
  getAlbums: () => {
    return axios.get('/user/photos/albums')
  },
  getPhotosBuAlbumId: (albumId: any, params: any) => {
    return axios.get('/user/albums/' + albumId + '/photos', {
      params: params
    })
  },
  // 增加/ 用户匹配后端服务
  getWebsiteConfig: () => {
    return axios.get('/user/')
  },
  qqLogin: (params: any) => {
    return axios.post('/user/users/oauth/qq', params)
  },
  report: () => {
    axios.post('/user/report')
  },
  getTalks: (params: any) => {
    return axios.get('/user/talks', {
      params: params
    })
  },
  getTalkById: (id: any) => {
    return axios.get('/user/talks/' + id)
  },
  logout: () => {
    return axios.post('/user/logout')
  },
  getRepliesByCommentId: (commentId: any) => {
    return axios.get(`/user/comments/${commentId}/replies`)
  },
  updatePassword: (params: any) => {
    return axios.put('/user/users/password', params)
  },
  accessArticle: (params: any) => {
    return axios.post('/user/articles/access', params)
  }
}
