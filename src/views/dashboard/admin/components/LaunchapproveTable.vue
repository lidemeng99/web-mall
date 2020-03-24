<template>

  <el-card class="box-card">
    <div slot="header">
      <span>上架申请</span>
    </div>
    <div>
      <el-table :data="products" style="width: 100%;">
        <el-table-column label="序号" width="50px" type="index" align="center" />
        <el-table-column label="商品名称" prop="productName" />
        <el-table-column label="申请人" align="center" prop="modifier" width="80px" />
        <el-table-column label="申请时间" align="center" prop="lastModifiedTime" width="90px" />
        <el-table-column label="操作" width="50">
          <template slot-scope="scope">
            <el-button size="mini" circle icon="el-icon-check" type="success" @click="doApprove(scope.row,scope.$index)" />
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-card>

</template>

<script>
import { fetchLaunchApproveList, updateState } from '@/api/product'
export default {
  data() {
    return {
      products: null
    }
  },
  created() {
    fetchLaunchApproveList(res => {
      this.products = res
    })
  },
  methods: {
    doApprove(item, index) {
      const _data = { type: 'LAUNCH_APPROVE', operator: this.$store.getters.name, item: item }
      updateState(_data, res => {
        this.products.splice(index, 1)
        this.$message.info('操作成功')
      })
    }

  }
}
</script>
