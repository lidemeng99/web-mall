<template>

  <el-card class="box-card">
    <div slot="header">
      <span>价格申请</span>
    </div>
    <div>
      <el-table :data="prices" style="width: 100%;">
        <el-table-column label="序号" width="50px" type="index" align="center" />
        <el-table-column label="商品名称" prop="productName" />
        <el-table-column label="商品价格" width="80px" align="right">
          <template slot-scope="scope">
            <span style="font-weight: bold;color:red;">￥{{ scope.row.price |toThousandFilter }}</span>
          </template>
        </el-table-column>
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
import { fetchPriceApproveList, updatePrice } from '@/api/product'
export default {
  data() {
    return {
      prices: null
    }
  },
  created() {
    fetchPriceApproveList(res => {
      this.prices = res
    })
  },
  methods: {
    doApprove(item, index) {
      const _data = { type: 'PRICE_APPROVE', operator: this.$store.getters.name, item: item }
      updatePrice(_data, res => {
        this.prices.splice(index, 1)
        this.$message.info('操作成功')
      })
    }

  }
}
</script>
