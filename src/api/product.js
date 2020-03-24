import request from '@/utils/request'

const states = ['INITIALLED', 'SUBMITTED', 'STOCKING', 'STOCKED', 'PRICING', 'PRICED', 'LAUNCHING', 'LAUNCHED', 'CANCELLING', 'CANCELLED']
export function fetchList(query) {
  return request({
    url: '/api/article/list',
    method: 'get',
    params: query
  })
}

export function updateState(command, onSuccess) {
  request({
    url: '/product-api/api/product/' + command.item.productId + '/status',
    method: 'PUT',
    data: {
      command: command.type,
      operator: command.operator
    }
  }).then(res => {
    onSuccess(res)
  }).catch(function(error) {
    console.log(error)
  })
}

export function updatePrice(command, onSuccess) {
  request({
    url: '/product-api/api/product/' + command.item.productId + '/status',
    method: 'PUT',
    data: {
      command: command.type,
      operator: command.operator,
      product: {
        price: command.item.price
      }
    }
  }).then(res => {
    onSuccess(res)
  }).catch(function(error) {
    console.log(error)
  })
}

export function updateStock(command, onSuccess) {
  request({
    url: '/product-api/api/product/' + command.item.productId + '/status',
    method: 'PUT',
    data: {
      command: command.type,
      operator: command.operator,
      product: {
        stock: command.item.total,
        unit: command.item.unit
      }
    }
  }).then(res => {
    onSuccess(res)
  }).catch(function(error) {
    console.log(error)
  })
}

export function fetchStockApproveList(onSuccess) {
  request({
    url: '/product-api/api/products?status=' + states.indexOf('STOCKING'),
    method: 'GET'
  }).then(res => {
    onSuccess(res)
  }).catch(function(error) {
    console.log(error)
  })
}

export function fetchPriceApproveList(onSuccess) {
  request({
    url: '/product-api/api/products?status=' + states.indexOf('PRICING'),
    method: 'GET'
  }).then(res => {
    onSuccess(res)
  }).catch(function(error) {
    console.log(error)
  })
}

export function fetchLaunchApproveList(onSuccess) {
  request({
    url: '/product-api/api/products?status=' + states.indexOf('LAUNCHING'),
    method: 'GET'
  }).then(res => {
    onSuccess(res)
  }).catch(function(error) {
    console.log(error)
  })
}
export function fetchCancelApproveList(onSuccess) {
  request({
    url: '/product-api/api/products?status=' + states.indexOf('CANCELLING'),
    method: 'GET'
  }).then(res => {
    onSuccess(res)
  }).catch(function(error) {
    console.log(error)
  })
}
