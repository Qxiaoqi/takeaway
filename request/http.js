// const baseUrl = 'https://mockapi.eolinker.com/6Y6DzHWfb3f3858b18bd7a627f329f8c609da909760182c';
// const baseUrl = 'https://132.232.51.6';
const baseUrl = 'https://www.ecanteens.cn';

const http = ({
  url = '',
  param = {},
  header = { 'content-type': 'application/json' },
  ...other
} = {}) => {
  let timeStart = Date.now();
  return new Promise((resolve, reject) => {
    wx.request({
      url: getUrl(url),
      data: param,
      header: header,
      // header: {
      //   'content-type': 'application/json' // 默认值 ,另一种是 "content-type": "application/x-www-form-urlencoded"
      // },
      ...other,
      complete: (res) => {
        console.log(`耗时${Date.now() - timeStart}`);
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
        } else {
          reject(res)
        }
      }
    })
  })
}

const getUrl = (url) => {
  if (url.indexOf('://') == -1) {
    url = baseUrl + url;
  }
  return url
}

// // get方法
// const _get = (url, param = {}) => {
//   return http({
//     url,
//     param
//   })
// }

// const _post = (url, param = {}) => {
//   return http({
//     url,
//     param,
//     method: 'post'
//   })
// }

module.exports = http;