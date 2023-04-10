<template>
  <el-card class="main-card" style="opacity: 0.95">
    <div class="article-title-container">
      <el-input
        v-model="article.articleTitle"
        size="medium"
        placeholder="输入文章标题"
        style="background-color: white; color: white" />
      <el-button
        type="danger"
        size="medium"
        class="save-btn"
        @click="saveArticleDraft"
        v-if="article.id == null || article.status == 3">
        保存草稿
      </el-button>
      <el-button type="danger" size="medium" @click="openModel" style="margin-left: 10px"> 发布文章 </el-button>
    </div>
    <mavon-editor ref="md" v-model="article.articleContent" @imgAdd="uploadImg" style="height: calc(100vh - 260px)" />
    <el-dialog width="40%" top="15vh" v-model="addOrEdit">
      <template #header="{ titleId, titleClass }">
        <div class="my-header">
          <h4 :id="titleId" :class="titleClass" style="color: var(--text-normal) !important">发布文章</h4>
        </div>
      </template>
      <el-form label-width="80px" size="medium" :model="article">
        <el-form-item label="文章分类">
          <el-tag
            type="success"
            v-show="article.categoryName"
            style="margin: 0 1rem 0 0"
            :closable="true"
            @close="removeCategory">
            {{ article.categoryName }}
          </el-tag>
          <el-popover placement="bottom-start" width="460" trigger="click" v-if="!article.categoryName">
            <div class="popover-title">分类</div>
            <el-autocomplete
              style="width: 100%"
              v-model="categoryName"
              :fetch-suggestions="searchCategories"
              placeholder="请输入分类名搜索，enter可添加自定义分类"
              :trigger-on-focus="false"
              @keyup.enter.native="saveCategory"
              @select="handleSelectCategories">
              <template v-slot="{ item }">
                <div>{{ item.categoryName }}</div>
              </template>
            </el-autocomplete>
            <div class="popover-container">
              <div v-for="item of categorys" :key="item.id" class="category-item" @click="addCategory(item)">
                {{ item.categoryName }}
              </div>
            </div>
            <template #reference>
              <el-button type="success" plain size="small"> 添加分类 </el-button>
            </template>
          </el-popover>
        </el-form-item>
        <el-form-item label="文章标签">
          <el-tag
            v-for="(item, index) of article.tagNames"
            :key="index"
            style="margin: 0 1rem 0 0"
            :closable="true"
            @close="removeTag(item)">
            {{ item }}
          </el-tag>
          <el-popover placement="bottom-start" width="460" trigger="click" v-if="article.tagNames.length < 3">
            <div class="popover-title">标签</div>
            <el-autocomplete
              style="width: 100%"
              v-model="tagName"
              :fetch-suggestions="searchTags"
              placeholder="请输入标签名搜索，enter可添加自定义标签"
              :trigger-on-focus="false"
              @keyup.enter.native="saveTag"
              @select="handleSelectTag">
              <template v-slot="{ item }">
                <div>{{ item.tagName }}</div>
              </template>
            </el-autocomplete>
            <div class="popover-container">
              <div style="margin-bottom: 1rem">添加标签</div>
              <el-tag v-for="(item, index) of tagList" :key="index" :class="tagClass(item)" @click="addTag(item)">
                {{ item.tagName }}
              </el-tag>
            </div>
            <template #reference>
              <el-button type="primary" plain size="small"> 添加标签 </el-button>
            </template>
          </el-popover>
        </el-form-item>
        <el-form-item label="文章类型">
          <el-select v-model="article.type" placeholder="请选择类型">
            <el-option v-for="item in typeList" :key="item.type" :label="item.desc" :value="item.type" />
          </el-select>
        </el-form-item>
        <el-form-item label="原文地址" v-if="article.type != 1">
          <el-input v-model="article.originalUrl" placeholder="请填写原文链接" />
        </el-form-item>
        <el-form-item label="上传封面">
          <el-upload
            class="upload-cover"
            drag
            action="/user/articles/images"
            multiple
            :headers="headers"
            :before-upload="beforeUpload"
            :on-success="uploadCover">
            <i class="el-icon-upload" v-if="article.articleCover == ''" />
            <div class="el-upload__text" v-if="article.articleCover == ''">将文件拖到此处，或<em>点击上传</em></div>
            <img v-else :src="article.articleCover" width="360" height="180" />
          </el-upload>
        </el-form-item>
        <el-form-item label="置顶">
          <el-switch
            v-model="article.isTop"
            active-color="#13ce66"
            inactive-color="#F4F4F5"
            :active-value="1"
            :inactive-value="0" />
        </el-form-item>
        <el-form-item label="推荐">
          <el-switch
            v-model="article.isFeatured"
            active-color="#13ce66"
            inactive-color="#F4F4F5"
            :active-value="1"
            :inactive-value="0" />
        </el-form-item>
        <el-form-item label="发布形式">
          <el-radio-group v-model="article.status">
            <el-radio :label="1">公开</el-radio>
            <el-radio :label="2">密码</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="访问密码" v-if="article.status == 2">
          <el-input v-model="article.password" placeholder="请填写文章访问密码" />
        </el-form-item>
      </el-form>
      <template v-slot:footer>
        <div>
          <el-button @click="addOrEdit = false">取 消</el-button>
          <el-button type="danger" @click="saveOrUpdateArticle"> 发 表 </el-button>
        </div>
      </template>
    </el-dialog>
  </el-card>
</template>

<script>
import * as imageConversion from 'image-conversion'
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router'
import api from '@/api/api'
import { useUserStore } from '../../stores/user'
import { ref, nextTick, onMounted, getCurrentInstance, computed } from 'vue'
export default {
  setup() {
    const route = useRoute()
    const router = useRouter()
    const ins = getCurrentInstance()
    const path = route.path
    const arr = path.split('/')
    // 获取url中的第三部分也就是id参数
    const articleId = arr[3]
    const addOrEdit = ref(false)
    const autoSave = ref(true)
    const categoryName = ref('')
    const tagName = ref('')
    const categorys = ref([])
    const tagList = ref([])
    const typeList = ref([
      { type: 1, desc: '原创' },
      { type: 2, desc: '转载' },
      { type: 3, desc: '翻译' }
    ])
    const config = ref({
      UPLOAD_SIZE: 10*1024
    })
    const article = ref({
      id: null,
      articleTitle: ins.appContext.config.globalProperties.$moment(new Date()).format('YYYY-MM-DD'),
      articleContent: '',
      articleCover: '',
      categoryName: null,
      tagNames: [],
      isTop: 0,
      type: 1,
      status: 1
    })

    const headers = { token: sessionStorage.getItem('token') }
    if (articleId) {
      api.editArticles(articleId).then(({ data }) => {
        article.value = data.data
      })
    } else {
      const article = sessionStorage.getItem('article')
      if (article) {
        article.value = JSON.parse(article)
      }
    }

    function listCategories() {
      api.searchCategories().then(({ data }) => {
        categorys.value = data.data
      })
    }
    function listTags() {
      api.searchTags().then(({ data }) => {
        tagList.value = data.data
      })
    }
    function openModel() {
      if (article.value.articleTitle.trim() == '') {
        this.$message.error('文章标题不能为空')
        return false
      }
      if (article.value.articleContent.trim() == '') {
        this.$message.error('文章内容不能为空')
        return false
      }
      listCategories()
      listTags()
      addOrEdit.value = true
    }
    function uploadCover(response) {
      article.value.articleCover = response.data
    }
    function beforeUpload(file) {
      return new Promise((resolve) => {
        if (file.size / 1024 < config.value.UPLOAD_SIZE) {
          resolve(file)
        }
        imageConversion.compressAccurately(file, config.value.UPLOAD_SIZE).then((res) => {
          resolve(res)
        })
      })
    }
    function uploadImg(pos, file) {
      debugger
      var formdata = new FormData()
      if (file.size / 1024 < config.value.UPLOAD_SIZE) {
        formdata.append('file', file)
        api.saveArticleImages(formdata).then(({ data }) => {
          ins.appContext.config.globalProperties.$refs.md.$img2Url(pos, data.data)
        })
      } else {
        imageConversion.compressAccurately(file, config.value.UPLOAD_SIZE).then((res) => {
          formdata.append('file', new window.File([res], file.name, { type: file.type }))
          api.saveArticleImages(formdata).then(({ data }) => {
            ins.appContext.config.globalProperties.$refs.md.$img2Url(pos, data.data)
          })
        })
      }
    }
    // 保存为草稿
    function saveArticleDraft() {
      if (article.value.articleTitle.trim() == '') {
        ins.appContext.config.globalProperties.$message.error('文章标题不能为空')
        return false
      }
      if (article.value.articleContent.trim() == '') {
        ins.appContext.config.globalProperties.$message.error('文章内容不能为空')
        return false
      }
      article.value.status = 3
      api.saveOrUpdateArticles(article.value).then(({ data }) => {
        if (data.success) {
          article.value.id = data.data
          router.push({ path: '/articles/edit/list' })
          anonymousPublishing(this.article)
          ins.appContext.config.globalProperties.$notify.success({
            title: '成功',
            message: '保存草稿成功'
          })
        } else {
          ins.appContext.config.globalProperties.$notify.error({
            title: '失败',
            message: data.message
          })
        }
      })
      autoSave.value = false
    }
    function saveOrUpdateArticle() {
      if (article.value.articleTitle.trim() == '') {
        ins.appContext.config.globalProperties.$message.error('文章标题不能为空')
        return false
      }
      if (article.value.articleContent.trim() == '') {
        ins.appContext.config.globalProperties.$message.error('文章内容不能为空')
        return false
      }
      if (article.value.categoryName == null) {
        ins.appContext.config.globalProperties.$message.error('文章分类不能为空')
        return false
      }
      if (article.value.tagNames.length == 0) {
        ins.appContext.config.globalProperties.$message.error('文章标签不能为空')
        return false
      }
      if (article.value.articleCover.trim() == '') {
        ins.appContext.config.globalProperties.$message.error('文章封面不能为空')
        return false
      }
      api.saveOrUpdateArticles(article.value).then(({ data }) => {
        if (data.success) {
          article.value.id = data.data
          anonymousPublishing(article.value)
          sessionStorage.removeItem('article')
          router.push({ path: '/articles/edit/list' })
          ins.appContext.config.globalProperties.$notify.success({
            title: '成功',
            message: data.message
          })
        } else {
          ins.appContext.config.globalProperties.$notify.error({
            title: '失败',
            message: data.message
          })
        }
        addOrEdit.value = false
      })
      autoSave.value = false
    }
    function autoSaveArticle() {
      if (
        autoSave.value &&
        article.value.articleTitle.trim() != '' &&
        article.value.articleContent.trim() != '' &&
        article.value.id != null
      ) {
        api.saveOrUpdateArticles(article.value).then(({ data }) => {
          if (data.success) {
            article.value.id = data.data
            anonymousPublishing(article.value)
            ins.appContext.config.globalProperties.$notify.success({
              title: '成功',
              message: '自动保存成功'
            })
          } else {
            ins.appContext.config.globalProperties.$notify.error({
              title: '失败',
              message: data.message
            })
          }
        })
      }
      if (autoSave.value && article.value.id == null) {
        sessionStorage.setItem('article', JSON.stringify(article.value))
      }
    }
    function searchCategories(queryString, cb) {
      let params = {
        keywords: queryString
      }
      api.searchCategories({params: params}).then(({ data }) => {
        cb(data.data)
      })
    }
    function handleSelectCategories(item) {
      addCategory({
        categoryName: item.categoryName
      })
    }
    function saveCategory() {
      if (categoryName.value.trim() != '') {
        addCategory({
          categoryName: categoryName
        })
        categoryName.value = ''
      }
    }
    function addCategory(item) {
      article.value.categoryName = item.categoryName
    }
    function removeCategory() {
      article.value.categoryName = null
    }
    function searchTags(keywords, cb) {
      api
        .searchTags({
          params: {
            keywords: keywords
          }
        })
        .then(({ data }) => {
          cb(data.data)
        })
    }
    function handleSelectTag(item) {
      addTag({
        tagName: item.tagName
      })
    }
    function saveTag() {
      if (tagName.value.trim() != '') {
        addTag({
          tagName: tagName.value
        })
        tagName.value = ''
      }
    }
    function addTag(item) {
      if (article.value.tagNames.indexOf(item.tagName) == -1) {
        console.log(item.tagName)
        article.value.tagNames.push(item.tagName)
      }
    }
    function removeTag(item) {
      const index = article.value.tagNames.indexOf(item)
      article.value.tagNames.splice(index, 1)
    }
    function anonymousPublishing(article) {
      // todo:当用户是未登录的匿名发布时，保存至local
      if (useUserStore().userInfo == '') {
        let storgeValue = 'articleList'
        let articleList = localStorage.getItem(storgeValue)
        if (articleList == null) {
          articleList = []
        } else {
          articleList = JSON.parse(articleList)
        }
        if (articleList.indexOf(article.id) == -1) {
          articleList.push(article.id)
          localStorage.setItem(storgeValue, JSON.stringify(articleList))
        }
      }
    }
    function tagClass(item) {
        const index = this.article.tagNames.indexOf(item.tagName)
        return index != -1 ? 'tag-item-select' : 'tag-item'
      }
    return{
      listCategories,
      listTags,
      openModel,
      uploadCover,
      beforeUpload,
      uploadImg,
      saveArticleDraft,
      saveOrUpdateArticle,
      autoSaveArticle,
      searchCategories,
      handleSelectCategories,
      saveCategory,
      addCategory,
      removeCategory,
      searchTags,
      handleSelectTag,
      saveTag,
      addTag,
      removeTag,
      anonymousPublishing,
      headers,
      article,
      config,
      typeList,
       addOrEdit,
     autoSave ,
     categoryName ,
     tagName,
     categorys,
     tagList,
     tagClass
    }
  },
  destroyed() {
    this.autoSaveArticle()
  }
}
</script>

<style scoped>
.article-title-container {
  display: flex;
  align-items: center;
  margin-bottom: 1.25rem;
  margin-top: 2.25rem;
}
.save-btn {
  margin-left: 0.75rem;
  background: #fff;
  color: #f56c6c;
}
.tag-item {
  margin-right: 1rem;
  margin-bottom: 1rem;
  cursor: pointer;
}
.tag-item-select {
  margin-right: 1rem;
  margin-bottom: 1rem;
  cursor: not-allowed;
  color: #ccccd8 !important;
}
.category-item {
  cursor: pointer;
  padding: 0.6rem 0.5rem;
}
.category-item:hover {
  background-color: #f0f9eb;
  color: #67c23a;
}
.popover-title {
  margin-bottom: 1rem;
  text-align: center;
}
.popover-container {
  margin-top: 1rem;
  height: 260px;
  overflow-y: auto;
}
.el-button {
  width: 70px;
}
</style>
<style >
.el-upload {
  --el-upload-dragger-padding-horizontal: 0px !important;
  --el-upload-dragger-padding-vertical: 0px;
}
</style>
