<template>
  <div class="app-container">
    <el-card v-for="(item,index) in list" :key="item.id" class="box-card" style="width:30%;float:left;margin-top:4px;margin-left: 2.5%;">
      <div slot="header" style="position: relative;">
        <span style="text-overflow: ellipsis;overflow: hidden;white-space: nowrap;display: block;">订单号：{{ item.orderid }}</span>
      </div>
      <div v-for="(child,i) in item.orderItems" :key="child.id" class="block" style="display:flex;flex-direction:row;border-bottom:1px solid #e6ebf5;">

        <el-image
          style="width: 80px; height: 80px;text-align:center;"
          src="https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg"
          fit="fit"
        />
        <div style="width:70%;margin:5px;">
          <div style="">{{ child.productname }}</div>
          <div style="height:40px;line-height:40px;font-size:20px;color:red;text-align:right;">x {{ child.quanlity }}</div>
        </div>

      </div>
      <div style="margin:5px;text-align:right;">
        <span style="font-size:10pt;color:#333;height:28px;line-height:28px;float:left;">下单时间: {{ item.createtime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        <el-button type="primary" @click="delivery(item.orderid,index)">发货</el-button>
      </div>
    </el-card>

    <el-card v-if="list.length===0" class="box-card" style="width:30%;height:200px;float:left;margin-top:4px;margin-left: 2.5%;text-align:center;position: relative;">
      <div style="position: absolute;left: 50%;top: 50%;transform: translate(-50%, -50%);">
        无待发货订单
      </div>
    </el-card>
  </div>
</template>

<script>
import { getOrderList, updateState } from '@/api/stock'

const states = ['INITIALLED', 'SUBMITTED', 'STOCKING', 'STOCKED', 'PRICING', 'PRICED', 'LAUNCHING', 'LAUNCHED', 'CANCELLING', 'CANCELLED']
export default {
  name: 'StockList',
  filters: {
    statusFilter(status) {
      const statusMap = {
        SUBMITTED: 'default',
        STOCKING: 'info',
        STOCKED: 'info',
        PRICING: 'warning',
        PRICED: 'warning',
        LAUNCHING: 'success',
        LAUNCHED: 'success',
        CANCELLING: 'danger',
        CANCELLED: 'danger'
      }
      return statusMap[status]
    },

    statusLabelFilter(status) {
      const statusLabelMap = {
        SUBMITTED: '已提交',
        STOCKING: '库存申请中',
        STOCKED: '库存申请完成',
        PRICING: '定价申请中',
        PRICED: '定价申请完成',
        LAUNCHING: '上架申请中',
        LAUNCHED: '已上架',
        CANCELLING: '下架申请中',
        CANCELLED: '已下架'
      }
      return statusLabelMap[status]
    }
  },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10
      },
      stock: {},
      priceApply: {},
      dialogStockVisible: false,
      dialogPriceVisible: false
    }
  },
  created() {
    getOrderList(res => {
      this.list = res
    })
  },
  methods: {
    delivery(_id, index) {
      const orderstate = {
        command: 'DELIVERY',
        order: {
          modifier: 'Opertor'
        }
      }
      updateState(_id, orderstate, res => {
        this.list.splice(index, 1)
        this.$message('操作成功')
      })
    }
  }
}

</script>

<style scoped>
.edit-input {
  padding-right: 100px;
}
.cancel-btn {
  position: absolute;
  right: 15px;
  top: 10px;
}
.el-card__body {
    padding: 10px;
}

</style>
