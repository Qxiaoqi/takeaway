//index.js
//获取应用实例
import Toast from '/@vant/weapp/toast/toast';
const app = getApp();
const api = require('../../request/api');
const promise = require('../../utils/promise');
const wxlogin = require('../../utils/wxlogin');

Page({
  data: {
    background: ['banner1', 'banner2', 'banner3'],
    indicatorDots: true,
    vertical: false,
    autoplay: false,
    interval: 2000,
    duration: 500,
    // tab切换
    active: 'east',
    // 店铺数据

    // 东苑
    shopEast: {
      data: [],
      isTips: false,
      isloading: true
    },
    // 中苑 
    shopCenter: {
      data: [],
      isTips: false,
      isloading: true
    },
    // 西苑
    shopWest: {
      data: [],
      isTips: false,
      isloading: true
    },

    // 弹出层
    show: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    // userInfo: {},
    tabbarHide: false
  },

  onLoad() {    
    let that = this;

    // 检查当前是否已经登录（是否有 storage），没有则重新登陆
    wx.getStorage({
      key: 'user',
      success(res) {
        console.log('拿到 storage，不用登陆');
        app.globalData.userInfo = JSON.parse(res.data);
        // 获取到 storage
      },
      fail(res) {
        console.log('未获取到 storage，需要判断授权信息');
        // 未获取到 storage
        // 查看当前小程序是否授权 storage失效后才需要检查
        // 后面用 promise改写回调地狱
        promise.getSetting()
          .then(res => {
            if (!res.authSetting['scope.userInfo']) {
              console.log('未授权，弹窗提示授权');
              // wx.hideTabBar();
              // that.setData({
              //   show: true,
              //   tabbarHide: true
              // })
              // 弹窗直接跳出后面的 promise
              return Promise.reject('success');
            } else {
              console.log('已授权，但是没有 user storage');
              // 授权情况下才能登录，说明 storage被主动删除
              // 获取用户信息 在 storage失效后才重新登录
              return wxlogin();
            }
          })
          .then(res => {
            // 用户信息
            console.log('wxlogin:', res);
            app.globalData.userInfo = res;
          })
          .catch(res => {
            console.log(res);
            if (res !== 'success') {
              console.log(res.message);
            }
          })
      }

    })


    // 修改每次 onload时，把三个 tab的店铺全部获取到，每次切换 tab的时候，不去重新获取
    // 如果想要刷新店铺，下拉刷新
    // 但是订单要每次重新获取

    // 获取三个 location店铺列表数据，三个互不影响
    api.getList.getLocationShop({
      location: '东苑'
    })
      .then(res => {
        console.log(res);
        if (res.code === 1) {
          this.setData({
            shopEast: {
              data: res.data,
              isTips: res.data.length === 0 ? true : false
            }
          }, () => {
            this.tab = this.selectComponent('#tabs');
            this.tab.setData({
              container: () => this.tab.createSelectorQuery().select('.van-tabs')
            })
          });
        } else {
          throw new Error('东苑获取失败');
        }
      })
      .catch(err => {
        console.log(err);
        Toast({
          type: 'fail',
          message: err.message || '发生错误'
        })
      })
      .finally(() => {
        // 取消 loading
        let loading = `shopEast.isloading`;
        console.log(loading);
        this.setData({
          [loading]: false
        });
      })

    // 中苑店铺
    api.getList.getLocationShop({
      location: '中苑'
    })
      .then(res => {
        console.log(res);
        if (res.code === 1) {
          this.setData({
            shopCenter: {
              data: res.data,
              isTips: res.data.length === 0 ? true : false
            }
          }, () => {
            this.tab = this.selectComponent('#tabs');
            this.tab.setData({
              container: () => this.tab.createSelectorQuery().select('.van-tabs')
            })
          });
        } else {
          throw new Error('中苑获取失败');
        }
      })
      .catch(err => {
        console.log(err);
        Toast({
          type: 'fail',
          message: err.message || '发生错误'
        })
      })
      .finally(() => {
        // 取消 loading
        let loading = `shopCenter.isloading`;
        console.log(loading);
        this.setData({
          [loading]: false
        });
      })

    // 西苑店铺
    api.getList.getLocationShop({
      location: '西苑'
    })
      .then(res => {
        console.log(res);
        if (res.code === 1) {
          this.setData({
            shopWest: {
              data: res.data,
              isTips: res.data.length === 0 ? true : false
            }
          }, () => {
            this.tab = this.selectComponent('#tabs');
            this.tab.setData({
              container: () => this.tab.createSelectorQuery().select('.van-tabs')
            })
          });
        } else {
          throw new Error('西苑获取失败');
        }
      })
      .catch(err => {
        console.log(err);
        Toast({
          type: 'fail',
          message: err.message || '发生错误'
        })
      })
      .finally(() => {
        // 取消 loading
        let loading = `shopWest.isloading`;
        console.log(loading);
        this.setData({
          [loading]: false
        });
      })

  },

  // 下拉刷新
  onPullDownRefresh() {
    const tabsData = {
      east: '东苑',
      center: '中苑',
      west: '西苑'
    };
    let active = this.data.active;
    let location = tabsData[active];
    let locStr = '';
    console.log(location);
    switch (active) {
      case 'east':
        locStr = 'East';
        break;
      case 'center':
        locStr = 'Center';
        break;
      case 'west':
        locStr = 'West';
        break;
    }
    console.log(locStr);

    // 刷新界面 重新赋值
    // 注意这里要改，不重新赋值，只修改 loading部分，
    // 不需要添加 loading，因为已经有了微信自带的
    // this.setData({
    //   ['shop' + locStr]: {
    //     data: [],
    //     isTips: false,
    //     isloading: true
    //   }
    // });
    // 获取当前 location店铺列表数据
    api.getList.getLocationShop({
      location: tabsData[active]
    })
      .then(res => {
        console.log(res);
        if (res.code === 1) {
          this.setData({
            ['shop' + locStr]: {
              data: res.data,
              isTips: res.data.length === 0 ? true : false
            }
          }, () => {
            this.tab = this.selectComponent('#tabs');
            this.tab.setData({
              container: () => this.tab.createSelectorQuery().select('.van-tabs')
            })
          });
        } else {
          throw new Error(`${tabsData[active]}获取失败`);
        }
      })
      .catch(err => {
        console.log(err);
        Toast({
          type: 'fail',
          message: err.message || '发生错误'
        })
      })
      .finally(() => {
        // let loading = `shop${locStr}.isloading`;
        // console.log(loading);
        // this.setData({
        //   [loading]: false
        // });
        wx.stopPullDownRefresh();
      })
  },
  
  // 切换 tab页
  bindChange(event) {
    console.log(event.detail.name);
    this.setData({
      active: event.detail.name
    });
    // let tabsData = {
    //   east: '东苑',
    //   center: '中苑',
    //   west: '西苑'
    // };

    // console.log(this.data.active);
    // console.log(tabsData[this.data.active]);
    // 获取当前 location店铺列表数据
    // api.getList.getLocationShop({
    //   location: tabsData[this.data.active]
    // })
    //   .then(res => {
    //     console.log(res);
    //     this.setData({
    //       shopData: res.data,
    //       loading: false
    //     });
    //   })
  },

  getUserInfo(e) {
    console.log(e);
    if (e.detail.userInfo) {
      // 拿到用户信息
      console.log('拿到用户信息');
      this.setData({
        show: false
      })
      // 还要保存调用登录接口，并将其保存
      wxlogin()
        .then(res => {
          console.log(res);
          app.globalData.userInfo = res;
        })
        .catch(res => {
          Toast('获取用户信息失败');
        })

      wx.showTabBar();
    } else {
      console.log('未拿到用户信息');
      Toast('请授权');
    }
    // console.log(e.detail.userInfo);
  },

  // 提示弹窗
  toolTip() {
    Toast('功能暂未完成');
  }
})


