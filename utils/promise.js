const promise = {
  login() {
    return new Promise((resolve, reject) => {
      wx.login({
        complete(res) {
          if (res.code) {
            resolve(res);
          } else {
            reject('wx.login调用失败');
          }
        }
      })
    })
  },

  getSetting() {
    return new Promise((resolve, reject) => {
      wx.getSetting({
        success(res) {
          resolve(res);
        },
        fail(res) {
          reject('wx.getSetting调用失败');
        }
      })
    })
  },

  getUserInfo() {
    return new Promise((resolve, reject) => {
      wx.getUserInfo({
        success(res) {
          resolve(res);
        },
        fail(res) {
          reject('getUserInfoErr');
        }
      })
    })
  }

}

module.exports = promise;