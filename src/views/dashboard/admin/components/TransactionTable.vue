<template>

  <el-card class="box-card">
    <div slot="header">
      <span>商品类目申请</span>
    </div>
    <div>
      <el-table :data="catalogs" style="width: 100%;">
        <el-table-column label="序号" prop="catalogName" type="index" />
        <el-table-column label="类目名称" prop="catalogName" />
        <el-table-column label="申请人" align="center" prop="modifier" />
        <el-table-column label="申请时间" align="center" prop="lastModifiedTime" />
        <el-table-column label="操作" width="50">
          <template slot-scope="scope">
            <el-button size="mini" circle icon="el-icon-check" type="success" @click="doApprove(scope.row)" />
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-card>

</template>

<script>
import request from '@/utils/request'
export default {
  // filters: {
  //   statusFilter(status) {
  //     const statusMap = {
  //       success: 'success',
  //       pending: 'danger'
  //     }
  //     return statusMap[status]
  //   },
  //   orderNoFilter(str) {
  //     return str.substring(0, 30)
  //   }
  // },
  data() {
    return {
      catalogs: null
    }
  },
  created() {
    request({
      url: '/product-api/api/catalogs',
      method: 'get',
      params: { pid: '', status: 1 }
    }).then(res => {
      this.catalogs = res
      console.log(this.catalogs)
    }
    ).catch(function(error) {
      console.log(error)
    })
  },
  methods: {
    doApprove(item) {
      const _data = { commandType: 'APPROVE', modifier: this.$store.getters.name }

      request({
        url: '/product-api/api/catalog/' + item.catalogId + '/status',
        method: 'put',
        data: _data
      }).then(rres => {
        this.$message('操作成功')
        this.catalogs.forEach((element, index) => {
          if (element.catalogId === item.catalogId) {
            this.catalogs.splice(index, 1)
            return
          }
        })
      }).catch(function(error) {
        console.log(error)
      })
    }

  }
}
</script>
