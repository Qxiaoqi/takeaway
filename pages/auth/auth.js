// pages/auth/auth.js
import Toast from '/@vant/weapp/toast/toast';
const app = getApp();
const wxlogin = require('../../utils/wxlogin');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  jumpBack() {
    wx.navigateBack({
      delta: 1
    })
  },

  getUserInfo(e) {
    const that = this;
    console.log(e);
    if (e.detail.userInfo) {
      wx.showLoading({
        title: '授权中',
      })
      // 拿到用户信息
      console.log('拿到用户信息');

      // 还要保存调用登录接口，并将其保存
      wxlogin()
        .then(res => {
          console.log(res);
          app.globalData.userInfo = res;
          wx.hideLoading();
          // 获取成功
          that.jumpBack();
        })
        .catch(res => {
          Toast('获取用户信息失败');
        })
    } else {
      console.log('未拿到用户信息');
      Toast('请授权');
    }
    // console.log(e.detail.userInfo);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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