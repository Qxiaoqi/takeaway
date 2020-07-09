// pages/manage/m-menu/m-menu.js
import Toast from '/@vant/weapp/toast/toast';
const api = require('../../../request/api');
const app = getApp();
// const wxlogin = require('../../../utils/wxlogin');
const getShopInfo = require('../../../utils/getShopInfo');


Page({

  /**
   * 页面的初始数据
   */
  data: {
    dish: [],
    shopId: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('onload');

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 获取店铺菜品列表
    let that = this;
    console.log(app.globalData.shop);
    if (app.globalData.shop) {
      // 直接从全局变量中拿
      api.manage.getDishList({
        data: {
          page: 0,
          rid: app.globalData.shop.objectId
        }
      })
        .then(res => {
          console.log(res);
          if (res.code === 1) {
            that.setData({
              dish: res.data,
              shopId: app.globalData.shop.objectId
            })
          }
        })
        .catch(e => {
          Toast({
            type: 'fail',
            message: '获取店铺失败'
          });
        })
    } else {
      getShopInfo()
        .then(res => {
          console.log(res);
          that.setData({
            shopId: res.data.objectId
          })
          // promise链式调用
          return api.manage.getDishList({
            data: {
              page: 0,
              rid: res.data.objectId
            }
          });
        })
        .then(res => {
          console.log(res);
          if (res.code === 1) {
            that.setData({
              dish: res.data
            })
          } else {
            throw Error();
          }
        })
        .catch(e => {
          Toast({
            type: 'fail',
            message: '获取店铺失败'
          });
        })
    }
  },

  jumpAddMenu() {
    wx.navigateTo({
      url: '/pages/manage/m-menu/add/add'
    })
  },

  jumpModify(event) {
    console.log(event.target.dataset.idx);
    let idx = event.target.dataset.idx;
    let that = this;
    // console.log(that.data.dish[idx]);
    wx.navigateTo({
      url: '/pages/manage/m-menu/modify/modify',
      success(res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('dishData', that.data.dish[idx]);
      }
    })
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