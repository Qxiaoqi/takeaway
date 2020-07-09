// pages/manage/m-order/m-order.js
import Toast from '/@vant/weapp/toast/toast';
const app = getApp();
const getShopInfo = require('../../../utils/getShopInfo');
const api = require('../../../request/api');


Page({

  /**
   * 页面的初始数据
   */
  data: {
    timeType: 'day',
    show: false,
    timeData: [],
    day: new Date().getDate(),
    month: new Date().getMonth() + 1,
    orderDayList: [],
    orderMonthList: [],
    orderTotalList: [],
    shopId: '',
    // 三个 tab页面加载
    loadingDay: false,
    loadingMonth: false,
    loadingTotal: false,
    // 三个 tab页面页码
    pageDayIndex: 1,
    pageMonthIndex: 1,
    pageTotalIndex: 1,
    pageTotalIndexId: 0,
    // 三个 tab页面到底
    isDayEnd: false,
    isMonthEnd: false,
    isTotalEnd: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('onload');
    let arr;
    // 赋值时间选择器
    if (this.data.timeType === 'day') {
      let day = new Date().getDate();
      arr = new Array(day).fill(0).map((x, index) => index + 1 + '日');
      this.setData({
        timeData: arr
      })
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    console.log('onshow');
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
      case 'total':
        type = 'total';
        time = '';
        break;
    }

    if (app.globalData.shop) {
      // 直接从全局变量中拿
      that.setData({
        shopId: app.globalData.shop.objectId
      })
      // 根据当前 tabs页，获取不同订单
      // 每次新展示的时候都是获取第一页的
      that.getOrderList(app.globalData.shop.objectId, type, time, 1, 0);
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

            that.getOrderList(res.data.objectId, type, time, 1, 0);
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

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    console.log('上拉触底');
    const that = this;
    let { timeType, shopId, pageTotalIndexId } = that.data;
    switch (timeType) {
      case 'day':
        break;
      case 'month':
        break;
      case 'total':
        let { loadingTotal, isTotalEnd, pageTotalIndex } = that.data;
        console.log('pageIndex:', pageTotalIndex);

        // 页面赋值之后再让其获取
        // 这里要加一个判断，如果在 loading状态中，则不应该让其继续请求
        // 而且如果 已经 isEnd了，则不应该继续请求
        if (loadingTotal === false && isTotalEnd === false) {
          that.setData({
            pageTotalIndex: pageTotalIndex + 1
          }, that.getOrderList(shopId, 'total', '', pageTotalIndex + 1, pageTotalIndexId))
        }
        break;
    }

  },


  getOrderList(shopId, type, time, pageIndex, pageIndexId) {
    let that = this;
    // 根据当前 tabs页，获取不同订单
    let promise;
    switch (type) {
      case 'day':
        console.log('日期:', time);

        that.setData({
          loadingDay: true,
        })
        promise = api.manage.getDayOrder({
          data: {
            day: parseInt(time),
            rid: shopId
          }
        })
        break;
      case 'month':
        that.setData({
          loadingMonth: true
        })
        promise = api.manage.getMonthOrder({
          data: {
            month: parseInt(time) - 1,
            rid: shopId
          }
        })
        break;
      case 'total':
        that.setData({
          loadingTotal: true
        })
        if (pageIndex === 1) {
          // 如果获取第一页，就将其全部赋初值
          // 每次新展示的时候都是获取第一页的
          that.setData({
            orderTotalList: [],
            pageTotalIndex: 1,
            isTotalEnd: false
          })
          // 并且获取第一页时，调用该接口
          promise = api.manage.getTotalOrder({
            data: {
              page: 1,
              rid: shopId
            }
          })
        } else {
          console.log('pageIndexId:', pageIndexId);
          promise = api.manage.getMoreTotalOrder({
            data: {
              id: pageIndexId,
              rid: shopId
            }
          })
        }
        break;
    }
    promise.then(res => {
      console.log(res);
      let { orderDayList, orderMonthList, orderTotalList } = this.data;
      if (res.code === 1) {
        let data = res.data;
        if (data.length === 0) {
          // 没有新的订单了
          switch (type) {
            case 'day':
              this.setData({
                isDayEnd: true
              })
              break;
            case 'month':
              this.setData({
                isMonthEnd: true
              })
              break;
            case 'total':
              this.setData({
                isTotalEnd: true
              })
              break;
          }

        }
        // 处理拿到的数据，重新添加姓名、手机、地址
        data.map(obj => {
          obj.name = obj.address.split('-')[0];
          obj.phone = obj.address.split('-')[1];
          obj.userAddress = obj.address.split('-')[2];
          obj.dishList = obj.dishList.replace(/-/g, '+');
          obj.priceDel = (obj.priceCount / 100).toFixed(2);
          obj.statusStr = obj.orderPayCode === 0 ? '订单未付款'
            : obj.orderStatusCode === 1022 ? '订单准备中'
            : obj.orderStatusCode === 1023 ? '订单配送中'
            : obj.orderStatusCode === 1024 ? '订单已完成'
            : '状态'
        });
        if (res.message === '获取当天订单成功') {
          console.log(data);
          that.setData({
            orderDayList: data,
            loadingDay: false
          }, () => {
            this.tab = this.selectComponent('#tabs');
            this.tab.setData({
              container: () => this.tab.createSelectorQuery().select('.van-tabs')
            })
          })
        }
        if (res.message === '获取本月订单成功') {
          that.setData({
            orderMonthList: data,
            loadingMonth: false
          }, () => {
            this.tab = this.selectComponent('#tabs');
            this.tab.setData({
              container: () => this.tab.createSelectorQuery().select('.van-tabs')
            })
          })
        }
        if (res.message === '获取订单集合成功' || res.message === '获取成功') {
          if (data.length > 0) {
            let newOrderList = [...orderTotalList, ...data];
            that.setData({
              orderTotalList: newOrderList,
              loadingTotal: false,
              pageTotalIndexId: data[data.length - 1].id
            }, () => {
              this.tab = this.selectComponent('#tabs');
              this.tab.setData({
                container: () => this.tab.createSelectorQuery().select('.van-tabs')
              })
            })
          }
        }
      } else {
        throw Error();
      }
    })
    .catch(err => {
      console.log(err);
      // 如果某次请求失败，由于代码将三个请求的处理放在了一起
      // 导致无法确定哪次请求出错，只能将所有 loading全部 false
      that.setData({
        loadingDay: false,
        loadingMonth: false,
        loadingTotal: false
      })
      Toast({
        type: 'fail',
        message: '获取日期失败'
      });
    })
    .finally(() => {
      that.setData({
        loadingTotal: false
      })
    })

  },

  // 选择 tabs页面
  choseType(event) {
    console.log(event.detail);
    const that = this;
    let type = event.detail.name;
    if (type === 'day') {
      let day = new Date().getDate();
      let arr = new Array(day).fill(0).map((x, index) => index + 1 + '日');
      this.setData({
        timeData: arr,
        timeType: 'day'
      })
      // 获取日订单
      that.getOrderList(that.data.shopId, type, that.data.day, 1, 0);
    }

    if (type === 'month') {
      console.log(that.data.month);
      let month = new Date().getMonth() + 1;
      let arr = new Array(month).fill(0).map((x, index) => index + 1 + '月');
  
      that.setData({
        timeData: arr,
        timeType: 'month'
      })
      // 获取月订单
      that.getOrderList(that.data.shopId, type, that.data.month, 1, 0);
    }

    if (type === 'total') {
      that.setData({
        timeType: 'total'
      })
      // 获取总订单
      that.getOrderList(that.data.shopId, type, '', 1, 0);
    }
  },

  selectTime() {
    this.setData({
      show: true
    });
  },

  closePopup() {
    this.setData({
      show: false
    });
  },

  confirmTime(event) {
    const { picker, value, index } = event.detail;
    console.log(picker);
    console.log(value);
    const that = this;
    let type = that.data.timeType;
    console.log(event.detail);
    switch (type) {
      case 'day':
        console.log('获取日订单');
        // 发请求获取日订单
        that.getOrderList(that.data.shopId, 'day', index + 1, 1, 0);
        that.setData({
          day: index + 1,
          show: false
        })
        break;
      case 'month':
        console.log('获取月订单');
        // 发请求获取日订单
        that.getOrderList(that.data.shopId, 'month', index + 1, 1, 0);
        that.setData({
          month: index + 1,
          show: false
        })
        break;
      case 'total':
        // 总订单下不会弹出时间选择器
        break;
    }

  },

  jumpOrder(event) {
    console.log(event.currentTarget.dataset);
    let type = event.currentTarget.dataset.idx.split('-')[0];
    let idx = event.currentTarget.dataset.idx.split('-')[1];
    let orderData = [];
    // console.log(type);
    // console.log(idx);
    switch (type) {
      case 'day':
        orderData = this.data.orderDayList[idx]
        break;
      case 'month':
        orderData = this.data.orderMonthList[idx]
        break;
      case 'total':
        orderData = this.data.orderTotalList[idx]
        break;
    }
    console.log(orderData);
    wx.navigateTo({
      url: '/pages/manage/m-order/detail/detail',
      success: function(res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('orderData', orderData)
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})