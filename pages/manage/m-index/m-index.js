// pages/manage/m-index/m-index.js
import Toast from '/@vant/weapp/toast/toast';

const app = getApp();
// const wxlogin = require('../../../utils/wxlogin');
const getShopInfo = require('../../../utils/getShopInfo');
const api = require('../../../request/api');
const initSocket = require('../../../utils/initSocket');
const { formatDay } = require('../../../utils/util');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    shop: {
      // avatar: '/images/shop_test.jpg',
      // name: '肯德基宅急送test',
      // description: '描述内容描述内容描述内容描述内容描述内容描述内容描述内容',
      // restaurantStatusCode: 1
    },
    restaurantStatusCode: '',
    show: false,
    actions: [
      {
        name: '营业',
        value: 1
      },
      {
        name: '休息',
        value: 0
      }
    ],
    newOrderNumber: 0,
    connected: false,
    printName: undefined,
    isLoading: false,
    todayBillNumber: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    app.watch$('newOrderNumber', () => {
      console.log('test发生改变');
      this.setData({
        newOrderNumber: app.globalData.newOrderNumber
      })
    })

  },

  // tt() {
  //   console.log('点击tt');
  //   app.globalData.newOrderNumber++;
  // },

 /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    console.log(app.globalData.shop);
    // console.log("onshowonshowonshowonshowonshowonshow:", app.globalData.printConnected);
    let that = this;
    that.setData({
      connected: app.globalData.printConnected,
      printName:  app.globalData.printName
    })

    getShopInfo()
      .then(res => {
        console.log(res);
        if (res.code === 1) {
          console.log(res.data);
          // 建立 ws 连接
          if (app.globalData.localSocket) {
            console.log('ws已经连接');
          } else {
            console.log('ws未连接');
            initSocket(res.data.userId);
          }
          app.globalData.shop = res.data;

          // 获取今日营业额
          that.getTodyBill(res.data.objectId);
          // 判断打印机是否已经连接

          that.setData({
            shop: res.data,
            restaurantStatusCode: res.data.restaurantStatusCode,
            newOrderNumber: app.globalData.newOrderNumber
          })
        } 
      })
      // .catch(err => {
      //   Toast({
      //     type: 'fail',
      //     message: '未获取到店铺信息'
      //   });
      // })
    // wx.getStorage({
    //   key: 'user',
    //   success(res) {
    //     console.log('拿到 storage');
    //     // console.log(res.data);
    //     console.log(JSON.parse(res.data).userId);
    //     // 设置店铺相关信息
    //     that.getShopInfo(JSON.parse(res.data).userId);
    //   },
    //   fail(res) {
    //     console.log('没有拿到 storage,需要重新登录');
    //     wxlogin()
    //       .then(res => {
    //         console.log(res);
    //         // 设置店铺相关信息
    //         that.getShopInfo(res.userId);
    //       })
    //   }
    // })
  },

  // getShopInfo(userId) {
  //   let that = this;

  //   // 拿到店铺信息
  //   api.user.getUserShop({
  //     userId: userId
  //   })
  //     .then(res => {
  //       console.log(res);
  //       if (res.code !== 0) {
  //         console.log(res.data);
  //         app.globalData.shop = res.data;
  //         that.setData({
  //           shop: res.data,
  //           restaurantStatusCode: res.data.restaurantStatusCode
  //         })
  //       } 
  //     })
  //     .catch(e => {
  //       Toast({
  //         type: 'fail',
  //         message: '未获取到店铺信息'
  //       });
  //     })
  // },
  refreshBill() {
    const { shop } = this.data;
    // console.log(this.data.shop);
    this.getTodyBill(shop.objectId);
  },

  getTodyBill(shopId) {
    let today = formatDay(new Date());
    const that = this;
    that.setData({
      isLoading: true
    })
    console.log(today);
    api.bill.getDayBill({
      data: {
        day: today,
        id: shopId,
        status: 1
      }
    })
      .then(res => {
        console.log(res);
        if (res.code === 1) {
          let todayBillNumber = (res.data / 100).toFixed(2);
          that.setData({
            todayBillNumber
          })
        }
        that.setData({
          isLoading: false
        })
      })
      .catch(err => {
        console.log(err);
        that.setData({
          isLoading: false
        })
      })
      // .finally(res => {
      //   that.setData({
      //     isLoading: false
      //   })
      // })
  },

  closeSheet() {
    this.setData({ show: false });
  },

  selectSheet(event) {
    console.log(event.detail);
    let that = this;

    // 更新店铺状态
    api.manage.updateShopStatus({
      data: {
        id: that.data.shop.objectId,
        status: event.detail.value
      }
    })
      .then(res => {
        console.log(res);
        if (res.code === 1) {
          Toast({
            type: 'text',
            message: '更新成功'
          });
          app.globalData.shop.restaurantStatusCode = event.detail.value;
          that.setData({
            restaurantStatusCode: event.detail.value
          })
        } else {
          Toast({
            type: 'fail',
            message: '更新店铺状态失败'
          });
        }
      })
      .catch(e => {
        Toast({
          type: 'fail',
          message: '出现错误'
        });
      })
  },

  selectStatus() {
    if (this.data.restaurantStatusCode === 0) {
      // 当前为停业
      this.setData({
        show: true,
        actions: [
          {
            name: '营业',
            value: 1
          },
          {
            name: '休息',
            value: 0,
            disabled: true
          }
        ]
      });
    } else if (this.data.restaurantStatusCode === 1) {
      // 当前为营业
      this.setData({
        show: true,
        actions: [
          {
            name: '营业',
            value: 1,
            disabled: true
          },
          {
            name: '休息',
            value: 0
          }
        ]
      });
    }
  },

  jumpShop() {
    wx.navigateTo({
      url: '/pages/manage/m-shop/m-shop'
    })
  },

  jumpPrintPage() {
    wx.navigateTo({
      url: '/pages/manage/m-print/m-print'
    })
  },

  // 提示弹窗
  toolTip() {
    Toast('功能暂未完成');
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

 

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})