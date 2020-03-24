<template>
  <div class="app-container">
    <el-table v-loading="listLoading" :data="list" row-key border highlight-current-row style="width: 100%">

      <el-table-column label="序号" align="center" type="index" />
      <el-table-column label="缩略图" align="center" width="80">
        <template scope="scope">
          <img :src="scope.row.thumbnail[0]" width="50" height="50">
        </template>
      </el-table-column>

      <el-table-column label="商品名称">
        <template slot-scope="scope">
          <span>{{ scope.row.productName }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="商品分类">
        <template slot-scope="scope">
          <span>{{ scope.row.catalogName }}</span>
        </template>
      </el-table-column>
      <el-table-column width="80px" label="库存数" align="right">
        <template slot-scope="scope">
          <span>{{ scope.row.stock | toThousandFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column width="80px" label="单位" align="right">
        <template slot-scope="scope">
          <span>{{ scope.row.unit }}</span>
        </template>
      </el-table-column>
      <el-table-column width="80px" label="商品价格" align="right">
        <template slot-scope="scope">
          <span>￥{{ scope.row.price |toThousandFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column width="120px" align="center" label="上架时间">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>

      <el-table-column class-name="status-col" label="状态" width="120px">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">
            {{ row.status | statusLabelFilter }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作" width="120px">
        <template slot-scope="scope">
          <el-dropdown style="font-size:12px" @command="handleCommand">
            <span class="el-dropdown-link">
              操作<i class="el-icon-arrow-down el-icon--right" />
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-if="scope.row.status==='SUBMITTED'||scope.row.status==='INITIALLED'" icon="el-icon-s-shop" :command="beforeHandleCommand('STOCK_APPLY',scope.row,scope.$index)">库存申请</el-dropdown-item>
              <el-dropdown-item v-if="scope.row.status==='STOCKED'" icon="el-icon-s-marketing" :command="beforeHandleCommand('PRICE_APPLY',scope.row,scope.$index)">价格申请</el-dropdown-item>
              <el-dropdown-item v-if="scope.row.status==='PRICED'" icon="el-icon-s-claim" :command="beforeHandleCommand('LAUNCH_APPLY',scope.row,scope.$index)">上架申请</el-dropdown-item>
              <el-dropdown-item v-if="scope.row.status==='LAUNCHED'" icon="el-icon-s-release" :command="beforeHandleCommand('CANCEL_APPLY',scope.row,scope.$index)">下架申请</el-dropdown-item>
              <el-dropdown-item icon="el-icon-delete" :command="beforeHandleCommand('DELETE',scope.row,scope.$index)">删除</el-dropdown-item>

            </el-dropdown-menu>
          </el-dropdown>

          <!-- <router-link :to="'/product/edit/'+scope.row.id">
            <el-button type="primary" size="mini" icon="el-icon-edit">
              Edit
            </el-button>
          </router-link> -->

        </template>
      </el-table-column>
    </el-table>
    <!-- <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" /> -->
    <el-dialog title="库存申请" :visible.sync="dialogStockVisible" width="30%">
      <el-form :model="stock">
        <el-form-item label="库存数量">
          <el-input-number v-model="stock.total" />
          <el-input v-model="stock.productId" type="hidden" />
        </el-form-item>
        <el-form-item label="库存单位">
          <el-select v-model="stock.unit" placeholder="请选择库存单位">
            <el-option label="件" value="件" />
            <el-option label="包" value="包" />
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="applyStock(stock)">提交</el-button>
        <el-button @click="dialogStockVisible = false">取消</el-button>

      </span>
    </el-dialog>
    <el-dialog title="价格申请" :visible.sync="dialogPriceVisible" width="30%">
      <el-form :model="priceApply">
        <el-form-item label="价格" style="font-size:12px;">
          <el-input v-model="priceApply.price" style="color:red;width:200px;" />
          <span style="color:red;">(￥{{ priceApply.price | toThousandFilter }})</span>
          <el-input v-model="priceApply.productId" type="hidden" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="applyPrice(priceApply)">提交</el-button>
        <el-button @click="dialogPriceVisible = false">取消</el-button>

      </span>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList } from '@/api/article'
import { updateState, updateStock, updatePrice } from '@/api/product'
import request from '@/utils/request'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

const states = ['INITIALLED', 'SUBMITTED', 'STOCKING', 'STOCKED', 'PRICING', 'PRICED', 'LAUNCHING', 'LAUNCHED', 'CANCELLING', 'CANCELLED']
export default {
  name: 'ProductList',
  components: { Pagination },
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
    this.getList()
  },
  methods: {
    beforeHandleCommand(_type, _item, _index) {
      return {
        type: _type,
        item: _item,
        index: _index
      }
    },
    applyPrice(priceApply) {
      const _command = {
        type: 'PRICE_APPLY',
        item: this.priceApply,
        operator: this.$store.getters.name
      }
      let _index
      this.list.forEach((item, index) => {
        if (item.productId === this.priceApply.productId) {
          _index = index
          return
        }
      })
      updatePrice(_command, res => {
        this.$message.info('操作成功')
        this.list[_index].price = this.priceApply.price
        this.list[_index].status = 'PRICING'
        this.dialogPriceVisible = false
      })
    },
    applyStock(stock) {
      const _command = {
        type: 'STOCK_APPLY',
        item: this.stock,
        operator: this.$store.getters.name
      }
      let _index
      this.list.forEach((item, index) => {
        if (item.productId === this.stock.productId) {
          _index = index
          return
        }
      })
      updateStock(_command, res => {
        this.$message.info('操作成功')
        this.list[_index].stock = this.stock.total
        this.list[_index].unit = this.stock.unit
        this.list[_index].status = 'STOCKING'
        this.dialogStockVisible = false
      })
    },
    handleCommand(command) {
      command.operator = this.$store.getters.name
      if (command.type === 'STOCK_APPLY') {
        this.dialogStockVisible = true
        this.stock = {
          productId: command.item.productId,
          total: command.item.stock,
          unit: command.item.unit
        }
        return
      } else if (command.type === 'PRICE_APPLY') {
        this.dialogPriceVisible = true
        this.priceApply = {
          productId: command.item.productId,
          price: command.item.price
        }
        return
      } else if (command.type === 'DELETE') {
        updateState(command, res => {
          this.list.splice(command.index, 1)
        })
      } else {
        updateState(command, res => {
          const item = command.item
          const _status_index = states.indexOf(item.status)
          if (_status_index === 0) {
            item.status = states[_status_index + 2]
          } else {
            item.status = states[_status_index + 1]
          }

          this.$set(this.catalogs, command.index, item)
        })
      }
    },
    getList() {
      this.listLoading = true
      request({
        url: '/product-api/api/products',
        method: 'get'
      }).then(res => {
        this.list = res
        res.forEach(element => {
          if (element.thumbnail !== '') {
            const urls = JSON.parse(element.thumbnail)
            element.thumbnail = []
            urls.forEach(element1 => {
              element.thumbnail.push(element1.id)
            })
          }
        })
      }).catch(function(error) {
        console.log(error)
      })
      this.listLoading = false
      // fetchList(this.listQuery).then(response => {
      //   this.list = response.data.items
      //   this.total = response.data.total
      //   this.listLoading = false
      // })
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
</style>
