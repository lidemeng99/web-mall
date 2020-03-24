<template>
  <div class="app-container">
    <el-card v-for="(item,index) in catalogs" :key="item.id" class="box-card" style="width:30%;height:200px;float:left;margin-top:4px;margin-left: 2.5%;">
      <div slot="header" style="position: relative;">

        <div v-if="item.status==='DRAFT'" class="tricon-draft">待提交</div>
        <div v-if="item.status==='SUBMITTED'" class="tricon-submit">待审批</div>
        <div v-if="item.status==='APPROVED'" class="tricon-approve">已发布</div>
        <span>{{ item.catalogName }}</span>

        <el-dropdown style="float:right;margin-right:4px;" @command="handleCommand">
          <span class="el-dropdown-link">
            操作<i class="el-icon-arrow-down el-icon--right" />
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-if="item.status!=='APPROVED'" icon="el-icon-plus" :command="beforeHandleCommand('ADDCHILD',item,index)">添加子类目</el-dropdown-item>
            <el-dropdown-item v-if="item.status!=='APPROVED'" icon="el-icon-check" :command="beforeHandleCommand('SUBMIT',item,index)" divided>提交审批</el-dropdown-item>
            <el-dropdown-item icon="el-icon-delete" :command="beforeHandleCommand('CANCEL',item,index)">删除类目</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <!-- <el-button size="mini" circle icon="el-icon-position" style="float: right;margin-left:2px;" type="success" :disabled="createDisable" />
        <el-button size="mini" circle icon="el-icon-delete" style="float: right;margin-left:2px;" type="danger" :disabled="createDisable" />
        <el-button size="mini" circle icon="el-icon-plus" style="float: right;margin-left:2px;" type="primary" @click="dialogFormVisible = true;isroot = 'display:block';level=1;handleNodeClick(item,index)" /> -->
      </div>
      <div>

        <el-tag v-for="child in item.children" v-if="child.status==='APPROVED'" :key="child.id" size="medium" style="margin:2px;">{{ child.catalogName }}</el-tag>
        <el-tag v-for="(child,postion) in item.children" v-if="item.status!=='APPROVED'" :key="child.id" size="medium" closable style="margin:2px;" @close="handleClose(child,postion,index)">{{ child.catalogName }}</el-tag>
      </div>

    </el-card>

    <el-card class="box-card" style="width:30%;height:200px;float:left;margin-top:4px;margin-left: 2.5%;text-align:center;position: relative;">
      <div style="position: absolute;left: 50%;top: 50%;transform: translate(-50%, -50%);">
        <el-button circle size="default" class="el-icon-plus" style="width:80px;height:80px;" @click="dialogFormVisible = true;isroot = 'display:none';level=0;" />
      </div>
    </el-card>

    <el-dialog title="创建商品类目" :visible.sync="dialogFormVisible">
      <el-form>
        <el-form-item label="上级商品类别" :style="isroot">
          <el-input v-model="catalog.parentName" />
          <el-input v-model="catalog.parentId" type="hidden" style="display:none;" />
          <el-input v-model="catalog.index" type="hidden" style="display:none;" />
        </el-form-item>
        <el-form-item label="类目名称">
          <el-input v-model="catalog.catalogName" />
        </el-form-item>
        <el-form-item label="类目描述">
          <el-input v-model="catalog.description" type="textarea" />
        </el-form-item>
        <el-form-item label="显示顺序">
          <el-input-number v-model="catalog.orderNum" controls-position="right" :min="1" :max="10" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="saveCatalogClick">确定</el-button>
      </span>
    </el-dialog>

  </div>

</template>

<script>

import request from '@/utils/request'
import { uuid } from '../../../utils'

const save_catalog = {
  catalogName: '',
  description: '',
  orderNum: 0,
  modifier: '',
  parentId: '',
  parentName: ''
}
export default {
  name: 'CatalogDetail',
  data() {
    return {
      catalogs: [],
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      isroot: 'display:block',
      level: 0,
      num: 1,
      dialogTableVisible: false,
      dialogFormVisible: false,
      createDisable: true,
      catalog: save_catalog
    }
  },
  computed: {
    message() {
      return 'The webmaster said that you can not enter this page...'
    }
  },
  created() {
    request({
      url: '/product-api/api/catalogs',
      method: 'get',
      params: { pid: '' }
    }).then(res => {
      this.catalogs = res
      this.catalogs.forEach((item, index) => {
        request({
          url: '/product-api/api/catalogs',
          method: 'get',
          params: { pid: item.catalogId }
        }).then(rres => {
          item.children = rres
          this.$set(this.catalogs, index, item)
        })
      })

      console.log(this.catalogs)
    }
    ).catch(function(error) {
      console.log(error)
    })
  },
  methods: {
    handleClose(item, index, rootindex) {
      const _data = { commandType: 'CANCEL', modifier: this.$store.getters.name }

      request({
        url: '/product-api/api/catalog/' + item.catalogId + '/status?cqrs_cancel=1',
        method: 'put',
        data: _data
      }).then(rres => {
        this.$message('操作成功')
        const pitem = this.catalogs[rootindex]
        pitem.children.splice(index, 1)

        this.$set(this.catalogs, rootindex, pitem)
      }).catch(function(error) {
        console.log(error)
      })
    },
    handleCommand(command) {
      if (command.type === 'ADDCHILD') {
        this.dialogFormVisible = true
        this.isroot = 'display:block'
        this.level = 1
        this.handleNodeClick(command.item, command.index)
      } else {
        const _data = { commandType: command.type, modifier: this.$store.getters.name }

        request({
          url: '/product-api/api/catalog/' + command.item.catalogId + '/status',
          method: 'put',
          data: _data
        }).then(rres => {
          this.$message('操作成功')

          command.item.status = (command.type === 'SUBMIT' ? 'SUBMITTED' : 'APPROVED')
          if (command.type === 'CANCEL') {
            this.catalogs.splice(command.index, 1)
          }
        }).catch(function(error) {
          console.log(error)
        })
      }
    },
    beforeHandleCommand(_type, _item, _index) {
      return {
        type: _type,
        item: _item,
        index: _index
      }
    },
    handleNodeClick(data, index) {
      console.log(data)
      this.$data.catalog = {}
      this.$data.catalog.orderNum = 1
      this.$data.createDisable = false
      this.$data.catalog.parentName = data.catalogName
      this.$data.catalog.parentId = data.catalogId
      this.$data.catalog.index = index
    },
    saveCatalogClick() {
      const _catalog = this.catalog
      const saveitem = {
        catalogName: _catalog.catalogName,
        description: _catalog.description,
        orderNum: _catalog.orderNum,
        modifier: this.$store.getters.name,
        parentId: ''
      }
      if (this.level === 0) {
        saveitem.catalogId = uuid()
      }
      request({
        url: this.level === 0 ? '/product-api/api/catalog' : ('/product-api/api/catalog/' + _catalog.parentId + '/child'),
        method: 'post',
        data: saveitem
      }).then(res => {
        this.dialogFormVisible = false
        if (this.level === 1) {
          const _item = this.catalogs[this.catalog.index]
          saveitem.catalogId = res
          _item.children.push(saveitem)
          this.$set(this.catalogs, this.catalog.index, _item)
          this.$message('子类目添加成功')
        } else {
          this.catalogs.push(saveitem)
          this.$message('类目创建成功')
        }
        this.catalog = {}
      }).catch(function(error) {
        console.log(error)
      })

      // console.log(this.$data.catalog)
      // createCatalog(this.$data.catalog)
      // this.$data.dialogFormVisible = false
    }
  }
}
</script>

<style>
  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
  }
  .el-dialog__footer {
    padding-top: 8px;
  }
  .el-card__header {
    line-height: 27.8px;
    padding: 10px 20px;
  }

.tricon-draft{
    width: 70px;
    height: 20px;
    font-size: 10px;
    background-color: indianred;
    color: #fff;
    position: absolute;
    top: -5px;
    right: -40px;
    -webkit-transform: rotate(45deg);
    transform: rotate(45deg);
    -webkit-box-shadow: 0px 0px 10px #888;
    box-shadow: 0px 0px 10px #888;
    text-align: center;
    line-height: 20px;
}
.tricon-submit{
    width: 70px;
    height: 20px;
    font-size: 10px;
    background-color:darkblue;
    color: #fff;
    position: absolute;
    top: -5px;
    right: -40px;
    -webkit-transform: rotate(45deg);
    transform: rotate(45deg);
    -webkit-box-shadow: 0px 0px 10px #888;
    box-shadow: 0px 0px 10px #888;
    text-align: center;
    line-height: 20px;
}
.tricon-approve{
    width: 70px;
    height: 20px;
    font-size: 10px;
    background-color:darkgreen;
    color: #fff;
    position: absolute;
    top: -5px;
    right: -40px;
    -webkit-transform: rotate(45deg);
    transform: rotate(45deg);
    -webkit-box-shadow: 0px 0px 10px #888;
    box-shadow: 0px 0px 10px #888;
    text-align: center;
    line-height: 20px;
}
</style>
