// pages/address/modify/modify.js
import Toast from '/@vant/weapp/toast/toast';
import Dialog from '/@vant/weapp/dialog/dialog';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: '',
    nameOld: '',
    phone: '',
    phoneOld: '',
    address: '',
    addressOld: '',
    idx: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const eventChannel = this.getOpenerEventChannel();
    // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
    eventChannel.on('addressIdx', (idx) => {
      console.log(idx);
      let address = {};
      let infoStorage = wx.getStorageSync('addressList');
      if (infoStorage) {
        console.log('找到storage');
        // Do something with return value
        address = JSON.parse(infoStorage).arr[idx];
        console.log(address);
        this.setData({
          idx: idx,
          nameOld: address.name,
          phoneOld: address.phone,
          addressOld: address.address,
          name: address.name,
          phone: address.phone,
          address: address.address,
        });
      } else {
        // 理论上不可能出现
        console.log('出现位置故障');
      }
    })
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
      let infoStorageNew = {};
      let data = {
        'name': name,
        'phone': phone,
        'address': address
      };
      let infoStorage = wx.getStorageSync('addressList');
      if (infoStorage) {
        console.log('找到storage');
        // Do something with return value
        infoStorageNew = JSON.parse(infoStorage);
        infoStorageNew.arr.splice(this.data.idx, 1, data);
        console.log(infoStorageNew);
        wx.setStorage({
          key: 'addressList',
          data: JSON.stringify(infoStorageNew)
        })
        wx.navigateBack({
          delta: 1
        })
      } else {
        console.log('理论上不会出现');
        Toast({
          type: 'fail',
          message: '没有找到该地址',
        });
      }
    }
  },

  // 设为默认地址
  setDefAddress() {
    let infoStorageNew = {};
    let infoStorage = wx.getStorageSync('addressList');
    if (infoStorage) {
      console.log('找到storage');
      // Do something with return value
      Dialog.confirm({
        title: '提醒',
        message: '确定设置该地址为默认地址吗'
      }).then(() => {
        // on confirm
        infoStorageNew = JSON.parse(infoStorage);
        infoStorageNew.def = this.data.idx;
        wx.setStorage({
          key: 'addressList',
          data: JSON.stringify(infoStorageNew)
        })
        wx.navigateBack({
          delta: 1
        })
      }).catch(() => {
        // on cancel
        console.log('没有设置');
      });
    } else {
      console.log('理论上不会出现');
      Toast({
        type: 'fail',
        message: '没有找到该地址',
      });
    }
  },

  // 删除地址
  deleteAddress() {
    let infoStorageNew = {};
    let infoStorage = wx.getStorageSync('addressList');
    if (infoStorage) {
      console.log('找到storage');
      // Do something with return value
      Dialog.confirm({
        title: '警告',
        message: '确定删除该地址吗'
      }).then(() => {
        // on confirm
        infoStorageNew = JSON.parse(infoStorage);
        infoStorageNew.arr.splice(this.data.idx, 1);
        wx.setStorage({
          key: 'addressList',
          data: JSON.stringify(infoStorageNew)
        })
        wx.navigateBack({
          delta: 1
        })
      }).catch(() => {
        // on cancel
        console.log('没有删除');
      });
    } else {
      console.log('理论上不会出现');
      Toast({
        type: 'fail',
        message: '没有找到该地址',
      });
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