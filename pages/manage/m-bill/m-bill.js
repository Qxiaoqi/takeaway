// pages/manage/m-bill/m-bill.js
import Toast from '/@vant/weapp/toast/toast';
const app = getApp();
const getShopInfo = require('../../../utils/getShopInfo');
const api = require('../../../request/api');
const { formatDay, formatMonth } = require('../../../utils/util');


Page({

  /**
   * 页面的初始数据
   */
  data: {
    timeType: 'day',
    popupShow: false,
    // 日期选择默认当天
    day: formatDay(new Date()),
    month: formatMonth(new Date()),
    currentDateDay: new Date().getTime(),
    currentDateMonth: new Date().getTime(),
    maxDate: new Date().getTime(),
    formatter(type, value) {
      if (type === 'year') {
        return `${value}年`;
      } else if (type === 'month') {
        return `${value}月`;
      }
      return value;
    },
    shopId: '',
    dayBillNumber: 0,
    monthBillNumber: 0,
    loadingDay: false,
    loadingMonth: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    let type = '';
    let time = '';
    switch(that.data.timeType) {
      case 'day':
        type = 'day';
        time = that.data.day;
        break;
      case 'month':
        type = 'month';
        time = that.data.month;
        break;
    }
    if (app.globalData.shop) {
      // 直接从全局变量中拿
      that.setData({
        shopId: app.globalData.shop.objectId
      })
      // 根据当前 tabs页，获取不同订单
      // 每次新展示的时候都是获取第一页的
      that.getBill(app.globalData.shop.objectId, type, time);
    } else {
      getShopInfo()
        .then(res => {
          console.log(res);
          if (res.code !== 0) {
            console.log(res.data);
            that.setData({
              shopId: res.data.objectId
            })
            // 根据当前 tabs页，获取不同订单

            that.getBill(res.data.objectId, type, time);
          } 
        })
        .catch(err => {
          Toast({
            type: 'fail',
            message: '获取店铺失败'
          });
        })
    }
  },

  // 获取账单
  getBill(shopId, type, time) {
    console.log(shopId, type, time);
    const that = this;
    if (type === 'day') {
      that.setData({
        loadingDay: true
      })
      console.log('请求日期数据');
      api.bill.getDayBill({
        data: {
          day: time,
          id: shopId,
          status: 1
        }
      })
        .then(res => {
          console.log(res);
          if (res.code === 1) {
            let dayBillNumber = (res.data / 100).toFixed(2);
            that.setData({
              dayBillNumber
            })
          }
        })
        .catch(err => {
          console.log(err);
        })
        .finally(res => {
          that.setData({
            loadingDay: false
          })
        })
    } else if (type === 'month') {
      console.log('请求月份数据');
      that.setData({
        loadingMonth: true
      })
      api.bill.getMonthBill({
        data: {
          month: time,
          id: shopId,
          status: 1
        }
      })
        .then(res => {
          console.log(res);
          if (res.code === 1) {
            let monthBillNumber = (res.data / 100).toFixed(2);
            that.setData({
              monthBillNumber
            })
          }
        })
        .catch(err => {
          console.log(err);
        })
        .finally(res => {
          that.setData({
            loadingMonth: false
          })
        })
    }
  },

  // 日期组件弹窗
  selectTime() {
    this.setData({
      popupShow: true
    });
  },

  closePopup() {
    this.setData({
      popupShow: false
    });
  },

  // 选择日期
  choseDay(event) {
    const that = this;
    const { shopId } = this.data;
    let time = event.detail;
    let day = formatDay(new Date(time));
    console.log(new Date(time));
    // 请求数据
    that.getBill(shopId, 'day', day);

    this.setData({
      currentDateDay: time,
      day: day,
      popupShow: false
    })
  },

  // 选择月份
  choseMonth(event) {
    const that = this;
    const { shopId } = this.data;
    let time = event.detail;
    let month = formatMonth(new Date(time));
    console.log(new Date(time));
    // 请求数据
    that.getBill(shopId, 'month', month);

    this.setData({
      currentDateMonth: time,
      month: month,
      popupShow: false
    })
  },

  // 选择 tabs页
  choseType(event) {
    const that = this;
    const { day, month } = this.data;
    let type = event.detail.name;
    console.log(type);
    if (type === 'day') {
      that.getBill(that.data.shopId, 'day', day);
    } else if (type === 'month') {
      that.getBill(that.data.shopId, 'month', month);
    }
    this.setData({
      timeType: type
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