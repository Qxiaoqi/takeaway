// pages/address/add/add.js
import Toast from '/@vant/weapp/toast/toast';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: '',
    phone: '',
    address: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  // 为了防止频繁触发 setData，改用键盘失焦时，同步数据
  // 但是失焦也有问题，输入最后一个地址的时候，点提交并没有失焦
  setName(event) {
    console.log(event.detail);
    this.setData({
      name: event.detail
    });
  },
  setPhone(event) {
    console.log(event.detail);
    this.setData({
      phone: event.detail
    });
  },
  setAddress(event) {
    console.log(event.detail);
    this.setData({
      address: event.detail
    });
  },

  // 保存地址
  saveAddress() {
    let name = this.data.name.replace(/(^\s*)|(\s*$)/g, '');
    let phone = this.data.phone.replace(/(^\s*)|(\s*$)/g, '');
    let address = this.data.address.replace(/(^\s*)|(\s*$)/g, '');

    if (name === '') {
      // console.log('姓名不能为空');
      Toast('姓名不能为空');
    } else if (!/^1[3-9]\d{9}$/.test(phone)) {
      // console.log('电话号码不正确');
      Toast('电话号码不正确');
    } else if (address === '') {
      // console.log('地址不能为空');
      Toast('地址不能为空');
    } else {
      // 全都正确，将地址存入本地 storage
      // info: {
      //   def: -1,
      //   arr: []
      // }
      let infoStorage = {};
      let addressArr = [];
      let data = {
        'name': name,
        'phone': phone,
        'address': address
      };
      let value = wx.getStorageSync('addressList');
      if (value) {
        console.log('找到storage');
        // Do something with return value
        infoStorage = JSON.parse(value);
        console.log(infoStorage);
        infoStorage.arr.push(data);
        wx.setStorage({
          key: 'addressList',
          data: JSON.stringify(infoStorage)
        })
        wx.navigateBack({
          delta: 1
        })
      } else {
        console.log('没找到storage');
        // Do something when catch error
        addressArr.push(data);
        infoStorage = {
          def: 0,
          arr: addressArr
        }
        wx.setStorage({
          key: 'addressList',
          data: JSON.stringify(infoStorage)
        })
        wx.navigateBack({
          delta: 1
        })
      }
    }
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