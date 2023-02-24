import axios from 'axios'
import { app } from '@/main'

axios.interceptors.request.use((config: any) => {
  config.headers['token'] = sessionStorage.getItem('token')
  // 预留之后使用
  config.headers['refreshToken'] = sessionStorage.getItem('refreshToken')
  return config
})

axios.interceptors.response.use(
  (response) => {
    switch (response.data.result) {
      case 1:
        app.config.globalProperties.$notify({
          title: 'Error',
          message: response.data.message,
          type: 'error'
        })
        break
      case 510:
        app.config.globalProperties.$notify({
          title: 'Error',
          message: '用户未登录',
          type: 'error'
        })
        break
    }
    return response
  },
  (error) => {
    return Promise.reject(error)
  }
)
export default {
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
    return axios.get('/user/articles/search', {
      params: params
    })
  },
  getAlbums: () => {
    return axios.get('/user/photos/albums')
  },
  getPhotosBuAlbumId: (albumId: any, params: any) => {
    return axios.get('/user/albums/' + albumId + '/photos', {
      params: params
    })
  },
  getWebsiteConfig: () => {
    return axios.get('/user')
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
