// pages/replace/replace.js
const api = require('../../request/api');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    shopData: [],
    loading: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      loading: true
    })
    // 获取当前 甜品饮品 列表数据
    api.getList.getTypeShop({
      data: {
        title: '快递代拿'
      }
    })
      .then(res => {
        console.log(res);
        this.setData({
          shopData: res.data
        });
        if (res.data.length === 0) {
          this.setData({
            isTips: true
          });
        }
      })
      .finally(() => {
        this.setData({
          loading: false
        })
      })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.setData({
      loading: true
    });
    // 获取当前 甜品饮品 列表数据
    api.getList.getTypeShop({
      data: {
        title: '快递代拿'
      }
    })
      .then(res => {
        console.log(res);
        this.setData({
          shopData: res.data
        });
        if (res.data.length === 0) {
          this.setData({
            isTips: true
          });
        }
      })
      .finally(() => {
        wx.stopPullDownRefresh();
        this.setData({
          loading: false
        });
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