<template>
  <div class="app-container">
    <el-card class="box-card">
      <el-form ref="product" :model="product" label-width="120px">
        <el-form-item label="商品名称">
          <el-input v-model="product.productName" />
        </el-form-item>
        <el-form-item label="所属分类">
          <el-cascader ref="cascaderAddr" v-model="selectedCatalog" :props="options" clearable style="width:220px;" />
        </el-form-item>
        <el-form-item label="商品简述">
          <el-input v-model="product.shortDesc" />
        </el-form-item>
        <el-form-item label="商品详述">
          <el-input v-model="product.fullDesc" type="textarea" />
        </el-form-item>
        <el-form-item label="图片上传">
          <el-upload
            :action="uploadurl"
            list-type="picture-card"
            :on-preview="handlePictureCardPreview"
            :on-remove="handleRemove"
            :on-success="imgUploadSuccess"
            :limit="3"
          >
            <i class="el-icon-plus" />
          </el-upload>
          <el-dialog :visible.sync="dialogVisible">
            <img width="100%" :src="dialogImageUrl" alt="">
          </el-dialog>
        </el-form-item>
        <el-form-item style="float:right;">
          <el-button type="primary" @click="submitForm('product')">提交</el-button>
          <el-button @click="resetForm('product')">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import request from '@/utils/request'

const empty_product = {
  catalogId: '',
  catalogName: '',
  commandType: '',
  fullDesc: '',
  modifier: '',
  productId: '',
  productName: '',
  shortDesc: '',
  thumbnail: ''
}
export default {
  name: 'ProductDetail',
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      options: {
        lazy: true,
        lazyLoad(node, resolve) {
          console.log(node.level)
          request({
            url: '/product-api/api/catalogs?status=2',
            method: 'get',
            params: { pid: node.value }
          }).then(res => {
            const nodes = Array.from(res)
              .map(item => ({
                value: item.catalogId,
                label: item.catalogName,
                level: node.level + 1,
                leaf: node.level >= 1
              }))
            resolve(nodes)
          }).catch(function(err) {
            console.log(err)
          })
        }
      },
      product: empty_product,
      selectedCatalog: [],
      picurls: [],
      dialogImageUrl: '',
      dialogVisible: false,
      uploadurl: '/product-api/api/s3/upload'
    }
  },
  created() {
    if (this.isEdit) {
      const id = this.$route.params && this.$route.params.id
      console.log(id)
    }
  },
  methods: {
    submitForm(formName) {
      console.log(this.product)
      this.product.commandType = 'CREATE'
      var catalogname; var catalogid = ''
      const item1 = this.$refs.cascaderAddr
      item1.getCheckedNodes().forEach(element => {
        catalogid = element.value
      })
      catalogname = item1.inputValue
      this.product.catalogId = catalogid
      this.product.catalogName = catalogname
      this.product.thumbnail = JSON.stringify(this.picurls)
      request({
        url: '/product-api/api/product',
        method: 'post',
        data: this.product
      }).then(rres => {
        this.$message('操作成功')
        this.product = {
          catalogId: '',
          catalogName: '',
          commandType: '',
          fullDesc: '',
          modifier: '',
          productId: '',
          productName: '',
          shortDesc: '',
          thumbnail: ''
        }
      }).catch(function(error) {
        console.log(error)
      })
      // this.$refs[formName].validate((valid) => {
      //   if (valid) {
      //     alert('submit!')
      //   } else {
      //     console.log('error submit!!')
      //     return false
      //   }
      // })
    },
    resetForm(formName) {
      this.product = {
        catalogId: '',
        catalogName: '',
        commandType: '',
        fullDesc: '',
        modifier: '',
        productId: '',
        productName: '',
        shortDesc: '',
        thumbnail: ''
      }
      this.picurls = []
    },
    handleRemove(file, fileList) {
      console.log(file, fileList)
    },
    handlePictureCardPreview(file) {
      console.log(file)
      this.dialogImageUrl = file.url
      this.dialogVisible = true
    },
    imgUploadSuccess(response, file, fileList) {
      this.picurls.push({ id: response })

      console.log(response)
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
label {
  font-weight: normal;
}
.el-form-item__label{
  font-size: 12px;
}
.el-cascader-node__label {
  font-size: 12px;
}
</style>
