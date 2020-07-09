const api = require('../request/api');
const promise = require('../utils/promise');

// 登陆的目的只是为了将获取到的用户信息保存到 storage中，仅此而已
// 如果发现 storage中没有用户信息，则将调用该方法，将其保存
const wxlogin = () => {
  return new Promise((resolve, reject) => {
    let userInfo = {};
    let genderArr = ['未知', '男性', '女性'];
    // 只能是在授权后的情况下
    // 后面用 promise改写回调地狱
    promise.getUserInfo()
      .then(res => {
        // 拿到用户信息
        // console.log(res);
        userInfo = res.userInfo;
        // console.log(userInfo);
        // 获取登录凭证 
        return promise.login();
      })
      .then(res => {
        // 拿到 临时 code
        let data = {
          code: res.code,
          nickname: userInfo.nickName,
          avatar: userInfo.avatarUrl,
          gender: genderArr[userInfo.gender]
        };
        console.log('调用api.user.login参数:', data);
        // 登录接口
        return api.user.login({
          data: data
        })
      })
      .then(res => {
        // 调用登录接口后，将信息保存到 storage中
        console.log('api.user.login:', res);
        if (res.code === 1) {
          let data = {
            userId: res.data.objectId,
            nickName: res.data.nickname,
            avatar: res.data.avatar,
            sex: res.data.gender
          }
          // 保存 storage
          wx.setStorage({
            key: "user",
            data: JSON.stringify(data)
          })
          resolve(data);
        } else {
          reject('api.user.login接口调用失败');
        }
      })
      .catch(err => {
        console.log(err);
        if (err === 'getUserInfoErr') {
          // 没有权限
          reject('getUserInfoErr');
        }
      })



    // wx.getUserInfo({
    //   success(res) {
        // let userInfo = res.userInfo;
        // // console.log(res.userInfo);
        // let genderArr = ['未知', '男性', '女性'];
    //     // 获取登录凭证 
    //     wx.login({
    //       success (res) {
    //         console.log(res);
    //         if (res.code) {
    //           console.log(userInfo);
    //           console.log({
    //             code: res.code,
    //             nickname: userInfo.nickName,
    //             avatar: userInfo.avatarUrl,
    //             gender: genderArr[userInfo.gender]
    //           });
    //           // 登录接口
    //           api.user.login({
    //             data: {
    //               code: res.code,
    //               nickname: userInfo.nickName,
    //               avatar: userInfo.avatarUrl,
    //               gender: genderArr[userInfo.gender]
    //             }
    //           })
    //             .then(res => {
    //               console.log(res);
    //               let data = {
    //                 userId: res.data.objectId,
    //                 nickName: res.data.nickName,
    //                 avatar: res.data.avatar,
    //                 sex: res.data.sex
    //               }
    //               // 保存 storage
    //               wx.setStorage({
    //                 key: "user",
    //                 data: JSON.stringify(data)
    //               })
    //               resolve(data);
    //             })
    //         } else {
    //           console.log('登录失败！' + res.errMsg)
    //         }
    //       }
    //     })
    //   }
    // })
  })

}

module.exports = wxlogin;