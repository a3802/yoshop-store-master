<!--
 * @Author: a3802 253092329@qq.com
 * @Date: 2023-06-03 21:18:24
 * @LastEditors: a3802 253092329@qq.com
 * @LastEditTime: 2023-06-04 22:55:02
 * @FilePath: \yoshop2.0-store-master\src\views\product\QList.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <a-card :bordered="false">
    <div class="card-title">{{ $route.meta.title }}</div>
    <div class="table-operator">
      <!-- 搜索板块 -->
      <a-row class="row-item-search">
        <a-form class="search-form" :form="searchForm" layout="inline" @submit="handleSearch">
          <a-form-item label="权益名称">
            <a-input v-decorator="['goodsName']" placeholder="请输入权益名称" />
          </a-form-item>
          <a-form-item label="权益分类">
            <a-tree-select :treeData="categoryListTree" :dropdownStyle="{ maxHeight: '500px', overflow: 'auto' }"
              allowClear v-decorator="['categoryId', { initialValue: 0 }]"></a-tree-select>
          </a-form-item>
          <a-form-item class="search-btn">
            <a-button type="primary" icon="search" html-type="submit">搜索</a-button>
          </a-form-item>
        </a-form>
      </a-row>
      <!-- 操作板块 -->
      <div class="row-item-tab clearfix">
        <div class="tab-list fl-l">
          <a-radio-group :defaultValue="queryParam.listType" @change="handleTabs">
            <a-radio-button value="all">全部</a-radio-button>
            <a-radio-button value="on_sale">出售中</a-radio-button>
            <a-radio-button value="off_sale">已下架</a-radio-button>
            <a-radio-button value="sold_out">已售罄</a-radio-button>
          </a-radio-group>
        </div>
        <a-button v-if="$auth('/goods/create')" class="fl-l" type="primary" icon="plus"
          @click="handleCreate">创建商品</a-button>
        <div v-if="selectedRowKeys.length" class="button-group">
          <a-button-group class="ml-10">
            <a-button v-action:status icon="arrow-up" @click="handleUpdateStatus(selectedRowKeys, true)">上架</a-button>
            <a-button v-action:status icon="arrow-down" @click="handleUpdateStatus(selectedRowKeys, false)">下架</a-button>
            <a-button v-action:delete icon="delete" @click="handleDelete(selectedRowKeys)">删除</a-button>
          </a-button-group>
        </div>
      </div>
    </div>
    <s-table ref="table" rowKey="product_id" :loading="isLoading" :columns="columns" :data="loadData"
      :rowSelection="rowSelection" :pageSize="70" :scroll="{ x: 1450 }">
      <!-- 商品名称 -->
      <span slot="product_name" slot-scope="text">
        <p class="twoline-hide" style="width: 270px;">{{ text }}</p>
      </span>
      <!-- 商品状态 -->
      <span slot="status" slot-scope="text, item">
        <a-tag class="cur-p" :color="text == 10 ? 'green' : 'red'"
          @click="handleUpdateStatus([item.product_id], text != 10)">{{ text == 10 ? '上架' : '下架' }}</a-tag>
      </span>
      <!-- 操作项 -->
      <div class="actions" slot="action" slot-scope="text, item">
        <a v-action:add @click="handleAdd({productIds:item.product_id, categoryIds:item.category_id})">添加</a>
      </div>
    </s-table>
  </a-card>
</template>

<script>
import * as ProductApi from '@/api/product'
import { ContentHeader, STable } from '@/components'
import CategoryModel from '@/common/model/Category'

// 表格表头
const columns = [
  {
    title: '商品ID',
    dataIndex: 'product_id'
  },
  {
    title: '商品名称',
    dataIndex: 'product_name',
    width: '330px',
    scopedSlots: { customRender: 'product_name' }
  },
  {
    title: '商品属性',
    dataIndex: 'product_type',
    scopedSlots: { customRender: 'product_type' }
  },
  {
    title: '商品面值(元)',
    dataIndex: 'face_value',
    scopedSlots: { customRender: 'face_value' }
  },
  {
    title: '商品成本(元)',
    dataIndex: 'purchase_price',
    scopedSlots: { customRender: 'purchase_price' }
  },
  {
    title: '库存状态',
    dataIndex: 'stock_status'
  },
  {
    title: '状态',
    dataIndex: 'status',
    scopedSlots: { customRender: 'status' }
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: '150px',
    fixed: 'right',
    scopedSlots: { customRender: 'action' }
  }
]

export default {
  name: 'QList',
  components: {
    ContentHeader,
    STable
  },
  data() {
    return {
      // 当前表单元素
      searchForm: this.$form.createForm(this),
      // 商品分类列表
      categoryListTree: [],
      // 查询参数
      queryParam: {
        listType: 'all'
      },
      // 正在加载
      isLoading: false,
      // 表头
      columns,
      // 选择的元素
      selectedRowKeys: [],
      // 加载数据方法 必须为 Promise 对象
      loadData: param => {
        return ProductApi.getFuluList({ ...param, ...this.queryParam })
          .then(response => {
            console.log(response.data.list);
            const pageNo = 1
            const data = response.data.list
            const totalCount = response.data.list.length
            const datas = { data, pageNo, totalCount }
            console.log(datas)
            return datas
          })
      }
    }
  },
  created() {
    // 默认的查询参数
    if (this.$route.query.listType) {
      this.queryParam.listType = this.$route.query.listType
    }
    // 获取商品分类列表
    this.getCategoryList()
  },
  computed: {
    rowSelection() {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: this.onSelectChange
      }
    }
  },
  methods: {

    /**
     * 选中项发生变化时的回调
     */
    onSelectChange(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys
    },

    // 切换tab
    handleTabs(e) {
      this.queryParam.listType = e.target.value
      this.handleRefresh(true)
    },

    // 确认搜索
    handleSearch(e) {
      e.preventDefault()
      this.searchForm.validateFields((error, values) => {
        if (!error) {
          this.queryParam = { ...this.queryParam, ...values }
          this.handleRefresh(true)
        }
      })
    },

    // 重置搜索表单
    handleReset() {
      this.searchForm.resetFields()
    },

    // 获取分类列表
    getCategoryList() {
      this.isLoading = true
      CategoryModel.getListFromScreen()
        .then(selectList => {
          this.categoryListTree = selectList
        })
        .finally(result => {
          this.isLoading = false
        })
    },

    // 修改商品状态(上下架)
    handleUpdateStatus(goodsIds, state = true) {
      if (!this.$auth('/goods/index.status')) {
        return false
      }
      this.isLoading = true
      ProductApi.state({ goodsIds, state })
        .then(result => {
          // 显示成功
          this.$message.success(result.message, 1.5)
          this.handleRefresh()
        })
        .finally(result => { this.isLoading = false })
    },

    /**
     * 添加数据库记录
     */
    handleAdd(productIds, categoryIds) {
      console.log(productIds);
      const app = this
      const modal = this.$confirm({
        title: '您确定要添加该商品吗?',
        content: '确认添加吗',
        onOk() {
          return ProductApi.add({ productIds, categoryIds })
            .then(result => {
              app.$message.success(result.message, 1.5)
              app.handleRefresh()
            })
            .finally(result => {
              modal.destroy()
            })
        }
      })
    },

    /**
     * 新增记录
     */
    handleCreate() {
      this.$router.push('/goods/create')
    },

    /**
     * 刷新列表
     * @param Boolean bool 强制刷新到第一页
     */
    handleRefresh(bool = false) {
      this.selectedRowKeys = []
      this.$refs.table.refresh(bool)
    }

  }
}
</script>
<style lang="less" scoped>
.ant-card-body {
  padding: 22px 29px 25px;
}

// 筛选tab
.tab-list {
  margin-right: 20px;
}
</style>
