// pages/user/user.js
const api = require('../../request/api');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    hasShop: false,
    avatar: '',
    username: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  jumpAuth() {
    wx.navigateTo({
      url: '/pages/auth/auth'
    })
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
    let that = this;
    // 获取用户 storage
    wx.getStorage({
      key: 'user',
      success(res) {
        console.log(JSON.parse(res.data));
        let user = JSON.parse(res.data);
        that.setData({
          avatar: user.avatar
        })
        api.user.getUserShop({
          userId: JSON.parse(res.data).userId
        })
          .then(res => {
            console.log(res);
            if (res.data !== null) {
              that.setData({
                hasShop: true
              })
            } 
          })
      },
      fail(err) {
        console.log('我的页面-没有拿到 storage');
      }
    })
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