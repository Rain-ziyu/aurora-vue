<template>
  <el-card class="main-card" style="opacity: 0.86;">
    <div class="article-status-menu">
      <span>状态</span>
      <span @click="changeStatus('all')" :class="isActive('all')">全部</span>
      <span @click="changeStatus('public')" :class="isActive('public')"> 公开 </span>
      <span @click="changeStatus('private')" :class="isActive('private')"> 私密 </span>
      <span @click="changeStatus('draft')" :class="isActive('draft')"> 草稿箱 </span>
      <span @click="changeStatus('delete')" :class="isActive('delete')"> 回收站 </span>
    </div>
    <div class="operation-container" >
      <el-button
       type="success"
        size="small"
        @click="router.push('/articles/edit')">
        新建文章
      </el-button>
      <el-button
        v-if="isDelete == 0"
        type="danger"
        size="small"
        icon="Delete"
        :disabled="articleIds.length == 0"
        @click="updateIsDelete = true">
        批量删除
      </el-button>
      <el-button
        v-else
        type="danger"
        size="small"
        icon="Delete"
        :disabled="articleIds.length == 0"
        @click="remove = true">
        批量删除
      </el-button>
      <el-button
        type="success"
        size="small"
        icon="Download"
        :disabled="articleIds.length == 0"
        style="margin-right: 1rem"
        @click="isExport = true">
        批量导出
      </el-button>
      <el-upload
        action="/user/articles/import"
        multiple
        style="width: 100px;display:inline-block;    position: relative; "
        :limit="9"
        :show-file-list="false"
        :headers="uploadHeaders" 
        :on-success="uploadArticle">
        <el-button type="primary" size="small" icon="Upload"> 批量导入 </el-button>
      </el-upload>
      <div style="margin-left: auto ;vertical-align: middle;">
        <el-select 
          clearable
          v-model="type"
          placeholder="请选择文章类型"
          size="small"
          style="margin-right: 1rem; width: 180px">
          <el-option label="全部" value="" />
          <el-option v-for="item in types" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-select
          clearable
          size="small"
          v-model="categoryId"
          filterable
          placeholder="请选择分类"
          style="margin-right: 1rem; width: 180px ;background-color: white !important;">
          <el-option label="全部" value="" />
          <el-option v-for="item in categories" :key="item.id" :label="item.categoryName" :value="item.id" />
        </el-select>
        <el-select
          clearable
          size="small"
          v-model="tagId"
          filterable
          placeholder="请选择标签"
          style="margin-right: 1rem; width: 180px">
          <el-option label="全部" value="" />
          <el-option v-for="item in tags" :key="item.id" :label="item.tagName" :value="item.id" />
        </el-select>
        <el-input
          clearable
          v-model="keywords"
          prefix-icon="el-icon-search"
          size="small"
          placeholder="请输入文章名"
          style="margin-right: 1rem; width: 180px ;"
          @keyup.enter.native="searchArticles" />
        <el-button type="primary" size="small" icon="Search" style="margin-left: 1rem" @click="searchArticles">
          搜索
        </el-button>
      </div>
    </div>
    <el-table border :data="articles" @selection-change="selectionChange" v-loading="loading">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="articleCover" label="文章封面" width="180" align="center">
        <template v-slot="scope" >
          <el-image
            class="article-cover"
            :src="
              scope.row.articleCover
                ? scope.row.articleCover
                : 'https://prod.huayu.asia:9000/sofa-server/photos/33e3fac466ef482582596310a6f98d37.jpg'
            " />
          <i v-if="scope.row.status == 1" class="iconfont el-icon-mygongkai article-status-icon" />
          <i v-if="scope.row.status == 2" class="iconfont el-icon-mymima article-status-icon" />
          <i v-if="scope.row.status == 3" class="iconfont el-icon-mycaogaoxiang article-status-icon" />
        </template>
      </el-table-column>
      <el-table-column prop="articleTitle" label="标题" align="center" />
      <el-table-column prop="categoryName" label="分类" width="110" align="center" />
      <el-table-column prop="tagDTOs" label="标签" width="170" align="center">
        <template v-slot="scope">
          <el-tag v-for="item of scope.row.tagDTOs" :key="item.tagId" style="margin-right: 0.2rem; margin-top: 0.2rem">
            {{ item.tagName }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="viewsCount" label="浏览量" width="70" align="center">
        <template v-slot="scope">
          <span v-if="scope.row.viewsCount">
            {{ scope.row.viewsCount }}
          </span>
          <span v-else>0</span>
        </template>
      </el-table-column>
      <el-table-column prop="type" label="类型" width="80" align="center">
        <template v-slot="scope">
          <el-tag :type="articleType(scope.row.type).tagType">
            {{ articleType(scope.row.type).name }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="发表时间" width="130" align="center">
        <template v-slot="scope">
          <el-icon style="top:2px"><Timer /></el-icon>
          {{ dateFormat(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column prop="updateTime" label="更新时间" width="130" align="center">
        <template v-slot="scope">
          <el-icon style="top:2px"><Timer /></el-icon>
          {{ dateFormat(scope.row.updateTime ) }}
        </template>
      </el-table-column>


      <el-table-column label="操作" align="center" width="150">
        <template v-slot="scope" >
        <div class="ops">
          <el-button type="primary" size="mini"  @click="editArticle(scope.row.id)" v-if="scope.row.isDelete == 0">
            编辑
          </el-button>
          <el-popconfirm
            title="确定删除吗？"
            style="margin-left: 10px"
            @confirm="updateArticleDelete(scope.row.id)"
            v-if="scope.row.isDelete == 0">
            <template #reference>
              <el-button size="mini" type="danger" > 删除 </el-button>
            </template>
          </el-popconfirm>
          <el-popconfirm
            title="确定恢复吗？"
            v-if="scope.row.isDelete == 1"
            @confirm="updateArticleDelete(scope.row.id)">
            <template #reference>
              <el-button size="mini" type="success" > 恢复 </el-button>
            </template>
          </el-popconfirm>
          <el-popconfirm
            style="margin-left: 10px"
            v-if="scope.row.isDelete == 1"
            title="确定彻底删除吗？"
            @confirm="deleteArticles(scope.row.id)">
            <template #reference>
              <el-button size="mini" type="danger" > 删除 </el-button>
            </template>
          </el-popconfirm>
        </div>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      class="pagination-container"
      background
      @size-change="sizeChange"
      @current-change="currentChange"
      :current-page="current"
      :page-size="size"
      :total="count"
      :page-sizes="[10, 20]"
      layout="total, sizes, prev, pager, next, jumper" />
    <el-dialog v-model="updateIsDelete" width="30%">
      <template #title>
        <div class="dialog-title-container" ><i class="el-icon-warning" style="color: #ff9900" />提示</div>
      </template>
      <div style="font-size: 1rem">是否删除选中项？</div>
      <template #footer>
        <div >
          <el-button @click="updateIsDelete = false">取 消</el-button>
          <el-button type="primary" @click="updateArticleDelete(null)"> 确 定 </el-button>
        </div>
      </template >
    </el-dialog>
    <el-dialog v-model="remove" width="30%">
      <template #title>
        <div class="dialog-title-container" ><i class="el-icon-warning" style="color: #ff9900" />提示</div>
      </template>
      <div style="font-size: 1rem">是否彻底删除选中项？</div>
      <template #footer>
      <div >
        <el-button @click="remove = false">取 消</el-button>
        <el-button type="primary" @click="deleteArticles(null)"> 确 定 </el-button>
      </div>
    </template>
    </el-dialog>
    <el-dialog v-model="isExport" width="30%">
      <template #title>
      <div class="dialog-title-container"><i class="el-icon-warning" style="color: #ff9900" />提示</div>
    </template>
      <div style="font-size: 1rem">是否导出选中文章？</div>
      <template #footer>
        <div >
          <el-button @click="isExport = false">取 消</el-button>
          <el-button type="primary" @click="exportArticles(null)"> 确 定 </el-button>
        </div>
      </template>
    </el-dialog>
  </el-card>
</template>

<script>
import api from '@/api/api'
import {useArticleStore} from '@/stores/article'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'


export default {
  created() {
 
    let articleStore = useArticleStore();
    this.current = articleStore.pageState.articleList
    this.listArticles()
    this.listCategories()
    this.listTags()
  },
  data: function () {
    return {
      uploadHeaders: { token: localStorage.getItem('token') },
      loading: true,
      updateIsDelete: false,
      remove: false,
      types: [
        {
          value: 1,
          label: '原创'
        },
        {
          value: 2,
          label: '转载'
        },
        {
          value: 3,
          label: '翻译'
        }
      ],
      router: useRouter(),
      activeStatus: 'all',
      articles: [],
      articleIds: [],
      categories: [],
      tags: [],
      keywords: null,
      type: null,
      categoryId: null,
      tagId: null,
      isDelete: 0,
      isExport: false,
      status: null,
      current: 1,
      size: 10,
      count: 0
    }
  },
  methods: {
    dateFormat(time){
      if(time!==null){
        var date = new Date(time);
        var year = date.getFullYear();
        var month = date.getMonth()+1;
        var day = date.getDate();
        return `${year}-${month}-${day}`
      }else{
        return '-'
      }

    },
    selectionChange(articles) {
      this.articleIds = []
      articles.forEach((item) => {
        this.articleIds.push(item.id)
      })
    },
    searchArticles() {
      this.current = 1
      this.listArticles()
    },
    editArticle(id) {
      this.$router.push({ path: '/articles/edit/' + id })
    },
    updateArticleDelete(id) {
      let param = {}
      if (id != null) {
        param.ids = [id]
      } else {
        param.ids = this.articleIds
      }
      param.isDelete = this.isDelete == 0 ? 1 : 0
      api.updateArticleDelete(param).then(({ data }) => {
        if (data.success) {
          this.$notify.success({
            title: '成功',
            message: data.message
          })
          this.listArticles()
        } else {
          this.$notify.error({
            title: '失败',
            message: data.message
          })
        }
        this.updateIsDelete = false
      })
    },
    deleteArticles(id) {
      let param = {}
      if (id == null) {
        param = { data: this.articleIds }
      } else {
        param = { data: [id] }
      }
      api.deleteArticles(param).then(({ data }) => {
        if (data.success) {
          this.$notify.success({
            title: '成功',
            message: data.message
          })
          // 移除local中彻底删除的值

          let arr = JSON.parse(localStorage.getItem('articleList')||'[]');
          if(arr.length!=0){
              arr = arr.filter(item => param.data.indexOf(item)  == -1)
              localStorage.setItem('articleList',JSON.stringify(arr))
          }
          this.listArticles()
        } else {
          this.$notify.error({
            title: '失败',
            message: data.message
          })
        }
        this.remove = false
      })
    },
    exportArticles(id) {
      var param = {}
      if (id == null) {
        param = this.articleIds
      } else {
        param = [id]
      }
     api.exportArticles(param).then(({ data }) => {
        if (data.success) {
          this.$notify.success({
            title: '成功',
            message: data.message
          })
          data.data.forEach((item) => {
            this.downloadFile(item)
          })
          this.listArticles()
        } else {
          this.$notify.error({
            title: '失败',
            message: data.message
          })
        }
        this.isExport = false
      })
    },
    downloadFile(url) {
      const iframe = document.createElement('iframe')
      iframe.style.display = 'none'
      iframe.style.height = 0
      iframe.src = url
      document.body.appendChild(iframe)
      setTimeout(() => {
        iframe.remove()
      }, 5 * 60 * 1000)
    },
    uploadArticle(data) {
      if (data.success) {
        this.$notify.success({
          title: '成功',
          message: '导入成功'
        })
        // todo:当用户是未登录的匿名发布时，保存至local
        if(useUserStore().userInfo==""){
          let storgeValue ="articleList"
          let articleList = localStorage.getItem(storgeValue)
          if(articleList==null){
            articleList = []
          }else{
            articleList = JSON.parse(articleList)
          }
          articleList.push(data.data)
          localStorage.setItem(storgeValue,JSON.stringify(articleList))
        }
        this.listArticles()
      } else {
        this.$notify.error({
          title: '失败',
          message: data.message
        })
      }
    },
    sizeChange(size) {
      this.size = size
      this.listArticles()
    },
    currentChange(current) {
      let articleStore = useArticleStore();
      this.current = current
      articleStore.updateArticleListPageState( current)
      this.listArticles()
    },
    changeStatus(status) {
      switch (status) {
        case 'all':
          this.isDelete = 0
          this.status = null
          break
        case 'public':
          this.isDelete = 0
          this.status = 1
          break
        case 'private':
          this.isDelete = 0
          this.status = 2
          break
        case 'draft':
          this.isDelete = 0
          this.status = 3
          break
        case 'delete':
          this.isDelete = 1
          this.status = null
          break
      }
      this.current = 1
      this.activeStatus = status
    },
    listArticles() {
      if(useUserStore().userInfo==""){
        if(JSON.parse(localStorage.getItem('articleList')||'[]').length>0){
        api.getUserArticlesByTempArticleIds({
            conditionVO:{
              current: this.current,
              size: this.size,
              keywords: this.keywords,
              categoryId: this.categoryId,
              status: this.status,
              tagId: this.tagId,
              type: this.type,
              isDelete: this.isDelete,
            },
            tempArticleIds:JSON.parse(localStorage.getItem('articleList'))
          }
        ).then(({ data }) => {
            if(data.data!=null){
              this.articles = data.data.records
              this.count = data.data.count
            }
            this.loading = false
        })
      }else{
        this.articles = []
              this.count = 0
        this.loading = false
      }
      }
      else{
        api.getUserArticles( {
          params: {
            current: this.current,
            size: this.size,
            keywords: this.keywords,
            categoryId: this.categoryId,
            status: this.status,
            tagId: this.tagId,
            type: this.type,
            isDelete: this.isDelete
          }
        })
        .then(({ data }) => {
            this.articles = data.data.records
            this.count = data.data.count
            this.loading = false
        })
      }

    },
    listCategories() {
      api.getAllCategories().then(({ data }) => {
        this.categories = data.data
      })
    },
    listTags() {
      api.getAllTags().then(({ data }) => {
        this.tags = data.data
      })
    }
  },
  watch: {
    type() {
      this.current = 1
      this.listArticles()
    },
    categoryId() {
      this.current = 1
      this.listArticles()
    },
    tagId() {
      this.current = 1
      this.listArticles()
    },
    status() {
      this.current = 1
      this.listArticles()
    },
    isDelete() {
      this.current = 1
      this.listArticles()
    }
  },
  computed: {
    articleType() {
      return function (type) {
        var tagType = ''
        var name = ''
        switch (type) {
          case 1:
            tagType = 'danger'
            name = '原创'
            break
          case 2:
            tagType = 'success'
            name = '转载'
            break
          case 3:
            tagType = 'primary'
            name = '翻译'
            break
        }
        return {
          tagType: tagType,
          name: name
        }
      }
    },
    isActive() {
      return function (status) {
        return this.activeStatus == status ? 'active-status' : 'status'
      }
    }
  }
}
</script>

<style scoped>
.el-button {
  width: 90px ;
}
.operation-container {
  margin-top: 1.5rem;
  display: flex;
  align-items: center;
  margin-bottom: 1.25rem;
}
.article-status-menu {
  font-size: 14px;
  margin-top: 40px;
  color: #999;
}
.article-status-menu span {
  margin-right: 24px;
}
.status {
  cursor: pointer;
}
.active-status {
  cursor: pointer;
  color: #333;
  font-weight: bold;
}
.article-cover {
  position: relative;
  width: 100%;
  height: 90px;
  border-radius: 4px;
}
.article-cover::after {
  content: '';
  background: rgba(0, 0, 0, 0.3);
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}
.article-status-icon {
  color: #fff;
  font-size: 1.5rem;
  position: absolute;
  right: 1rem;
  bottom: 1.4rem;
}
.ops .el-button {
  width: 45px;
}

</style>
<style >
/* 单独控制删除弹出的气泡框 */
.el-popconfirm__action  .el-button {  
    width: 50px !important;
  }
</style>
