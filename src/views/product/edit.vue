<template>
  <ProductDetail :is-edit="true" />
</template>

<script>
import ProductDetail from './components/ProductDetail'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style

export default {
  name: 'EditProduct',
  components: { ProductDetail },
  created() {
    NProgress.start()
    const visitedViews = this.$store.state.tagsView.visitedViews
    visitedViews.forEach(visitedView => {
      if (visitedView.path.indexOf('/product/edit') > -1) {
        visitedView.title = '动态路由'
      }
    })
    NProgress.done()
  }

}
</script>
