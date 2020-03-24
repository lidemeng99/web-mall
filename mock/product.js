import Mock from 'mockjs'

export default [
  {
    url: '/api/catalog/create',
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  }
]
