<template>

  <el-card class="box-card">
    <div slot="header">
      <span>库存列表</span>
    </div>
    <div>
      <el-table :data="stocks" style="width: 100%;">
        <el-table-column label="序号" width="50px" type="index" align="center" />
        <el-table-column label="商品编号" prop="productName" />
        <el-table-column label="总库存" align="center" prop="actualStock.total" width="80px" />
        <el-table-column label="预警库存" align="center" width="90px">
          <template slot-scope="scope">
            {{ scope.row.actualStock.warning }}
          </template>
        </el-table-column>
        <el-table-column label="实际库存" align="center" width="90px">
          <template slot-scope="scope">
            {{ scope.row.actualStock.total - scope.row.actualStock.actual }}
          </template>
        </el-table-column>
        <el-table-column label="库存状态" align="center" width="90px">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.actualStock.status === 1" type="success">正常</el-tag>
            <el-tag v-if="scope.row.actualStock.status === 2" type="warning">预警</el-tag>
            <el-tag v-if="scope.row.actualStock.status === 3" type="danger">缺货</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-card>

</template>

<script>
import { getStocks } from '@/api/stock'
export default {
  data() {
    return {
      stocks: null
    }
  },
  created() {
    getStocks(res => {
      res.forEach((element, index) => {
        if (element.actualStock === null) {
          res.splice(index)
        } else {
          const left = element.actualStock.total - element.actualStock.actual

          if (left > element.actualStock.warning) {
            element.actualStock.status = 1
          } else if (left > 0 && left <= element.actualStock.warning) {
            element.actualStock.status = 2
          } else if (left <= 0) {
            element.actualStock.status = 3
          }
        }
      })
      console.info(res)
      this.stocks = res
    })
  },
  methods: {

  }
}
</script>
