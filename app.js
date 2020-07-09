//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    let logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  },

  globalData: {
    userInfo: null,
    newOrderNumber: 0
  },

  /** 监听函数的对象数组 */
  watchCallBack: {},

  /** 监听列表 */
  watchingKeys: [],

  /** 初始化 */
  init() {
    // 全局数据
    this.globalData$ = Object.assign({}, this.globalData);
  },

  /** 设置全局数据 */
  setGlobalData(obj) {
    // eslint-disable-next-line array-callback-return
    Object.keys(obj).map(key => {
      this.globalData[key] = obj[key];
    })
  },

  /** watch函数 */
  // defineProperty双向绑定
  watch$(key, cb) {
    this.watchCallBack = Object.assign({}, this.watchCallBack, {
      [key]: this.watchCallBack[key] || []
    })
    this.watchCallBack[key].push(cb);
    if (!this.watchingKeys.find(x => x === key)) {
      const that = this;
      this.watchingKeys.push(key);
      let val = this.globalData[key];
      Object.defineProperty(this.globalData, key, {
        configurable: true,
        enumerable: true,
        set(value) {
          const old = that.globalData[key];
          val = value;
          that.watchCallBack[key].map(func => func(val, old));
        },
        get() {
          return val;
        }
      })
    }
  }

})