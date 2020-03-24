import request from '@/utils/request'

export function getOrderList(onSuccess) {
  request({
    url: '/sales-api/api/orders/allocating',
    method: 'GET'
  }).then(res => {
    onSuccess(res)
  }).catch(function(error) {
    console.log(error)
  })
}

export function getStocks(onSuccess) {
  request({
    url: '/product-api/api/stocks',
    method: 'GET'
  }).then(res => {
    onSuccess(res)
  }).catch(function(error) {
    console.log(error)
  })
}

export function updateState(orderid, data, onSuccess) {
  request({
    url: '/sales-api/api/order/' + orderid + '/status',
    data: data,
    method: 'PUT'
  }).then(res => {
    onSuccess(res)
  }).catch(function(error) {
    console.log(error)
  })
}
