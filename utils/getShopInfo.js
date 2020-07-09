const api = require('../request/api');
const wxlogin = require('./wxlogin');

const getShopInfo = () => {
  return new Promise((resolve, reject) => {
    wx.getStorage({
      key: 'user',
      success(res) {
        console.log('拿到 storage');
        // console.log(res.data);
        console.log(JSON.parse(res.data).userId);
        // 拿到店铺信息
        api.user.getUserShop({
          userId: JSON.parse(res.data).userId
        })
          .then(res => {
            console.log(res);
            resolve(res);
          })
          .catch(err => {
            reject(err);
          })
      },
      fail(res) {
        console.log('没有拿到 storage,需要重新登录');
        wxlogin()
          .then(res => {
            console.log(res);
            // 设置店铺相关信息
            // getShopInfo(res.userId);
            // 拿到店铺信息
            api.user.getUserShop({
              userId: res.userId
            })
              .then(res => {
                console.log(res);
                resolve(res);
              })
              .catch(err => {
                reject(err);
              })
          })
      }
    })
  })
}



module.exports = getShopInfo;