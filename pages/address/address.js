// pages/address/address.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    addressList: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // let that = this;
    // wx.getStorage({
    //   key: 'addressList',
    //   success (res) {
    //     console.log(JSON.parse(res.data));
    //     that.setData({
    //       addressList: JSON.parse(res.data)
    //     });
    //   }
    // })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    let that = this;
    wx.getStorage({
      key: 'addressList',
      success (res) {
        console.log(JSON.parse(res.data));
        that.setData({
          addressList: JSON.parse(res.data)
        });
      }
    })
  },
  jumpAddAddress() {
    wx.navigateTo({
      url: '/pages/address/add/add'
    })
  },
  jumpModAddress(event) {
    console.log(event.currentTarget.dataset.idx);
    wx.navigateTo({
      url: '/pages/address/modify/modify',
      success(res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('addressIdx', event.currentTarget.dataset.idx);
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