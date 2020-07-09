// pages/order/order.js
import Toast from '/@vant/weapp/toast/toast';
import Dialog from '/@vant/weapp/dialog/dialog';
const api = require('../../request/api');
const wxlogin = require('../../utils/wxlogin');
const app = getApp();


Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderList: [],
    pageIndex: 1,   // 初始页码
    loading: false,
    isEnd: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // const that = this;
    // // 检查当前是否已经登录（是否有 storage），没有则重新登陆
    // wx.getStorage({
    //   key: 'user',
    //   success(res) {
    //     console.log('拿到 storage，不用登陆');
    //     console.log(JSON.parse(res.data).userId);
    //     that.setData({
    //       userId: JSON.parse(res.data).userId
    //     })
    //   },
    //   fail(res) {
    //     wxlogin()
    //       .then(res => {
    //         console.log(res.userId);
    //         that.setData({
    //           userId: res.userId
    //         })
    //       })
    //       .catch(res => {
    //         console.log(res);
    //       })
    //   }
    // })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    const that = this;
    if (app.globalData.userInfo) {
      console.log(app.globalData.userInfo);
      // 每次新展示的时候都是获取第一页的
      that.setData({
        pageIndex: 1,
        orderList: [],
        loading: false,
        isEnd: false
      })
      that.getUserOrder(app.globalData.userInfo.userId, 1);
    } else {
      // 检查当前是否已经登录（是否有 storage），没有则重新登陆
      wx.getStorage({
        key: 'user',
        success(res) {
          console.log('拿到 storage，不用登陆');
          console.log(JSON.parse(res.data));
          app.globalData.userInfo = JSON.parse(res.data);
          // 每次新展示的时候都是获取第一页的
          that.setData({
            pageIndex: 1,
            orderList: [],
            loading: false,
            isEnd: false
          })
          that.getUserOrder(JSON.parse(res.data).userId, 1);
        },
        fail(res) {
          wxlogin()
            .then(res => {
              console.log(res.userId);
              app.globalData.userInfo = res;
              // 每次新展示的时候都是获取第一页的
              that.setData({
                pageIndex: 1,
                orderList: [],
                loading: false,
                isEnd: false
              })
              that.getUserOrder(res.userId, 1);
            })
            .catch(res => {
              console.log(res);
              if (res === 'getUserInfoErr') {
                // 未授权
                Toast({
                  type: 'text',
                  message: '登陆后查看',
                  duration: 2000,
                  onClose: () => {
                    console.log('执行OnClose函数');
                    wx.switchTab({
                      url: '/pages/user/user'
                    })
                  }
                });
              }
            })
        }
      })
    }

  },

  onReachBottom() {
    console.log('上拉触底');
    const that = this;
    let { pageIndex, loading, isEnd } = this.data;
    console.log('pageIndex:', pageIndex);
    // 页面赋值之后再让其获取
    // 这里要加一个判断，如果在 loading状态中，则不应该让其继续请求
    // 而且如果 已经 isEnd了，则不应该继续请求
    if (loading === false && isEnd === false) {
      that.setData({
        pageIndex: pageIndex + 1,
        loading: true
      }, that.getUserOrder(app.globalData.userInfo.userId, pageIndex + 1))
    }
    
  },


  getUserOrder(userId, pageIndex) {
    let { orderList } = this.data;
    // 获取当前 用户订单列表
    // 后面要改参数
    api.getList.getUserOrderList({
      data: {
        page: pageIndex,
        uid: userId
      }
    })
      .then(res => {
        console.log(res);
        if (res.code === 1) {
          let data = res.data;
          if (data.length === 0) {
            // 没有新的订单了
            this.setData({
              isEnd: true
            })
          } else {
            data.map(obj => {
              obj.priceDel = (obj.priceCount / 100).toFixed(2);
              obj.dishList = obj.dishList.replace(/-/g, '+');
              obj.statusStr = obj.orderPayCode === 0 ? '订单未付款'
                : obj.orderStatusCode === 1022 ? '订单准备中'
                : obj.orderStatusCode === 1023 ? '订单配送中'
                : obj.orderStatusCode === 1024 ? '订单已完成'
                : '状态'
            });
            let newOrderList = [...orderList, ...data];
            this.setData({
              orderList: newOrderList
            });
          }
        } else {
          throw new Error('获取订单失败');
        }
      })
      .catch(res => {
        Toast({
          type: 'fail',
          message: res.message || '发生错误'
        })
      })
      .finally(() => {
        this.setData({
          loading: false
        });
      })
  },

  // 跳转进入 订单详情页
  jumpOrder(event) {
    console.log(event.currentTarget.dataset.idx);
    let idx = event.currentTarget.dataset.idx;
    let that = this;
    // console.log(that.data.orderData);
    wx.navigateTo({
      url: '/pages/order/detail/detail',
      success(res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('orderData', that.data.orderList[idx]);
      }
    })
  },

  confirmService(event) {
    // console.log(event.target.dataset.idx);
    const { orderList } = this.data;
    const that = this;
    const idx = event.target.dataset.idx;
    Dialog.confirm({
      title: '提醒',
      message: '您是否确认外卖已送达？'
    }).then(() => {
      // on confirm
      console.log(orderList[idx]);
      let objectId = orderList[idx].objectId;
      api.manage.updateOrderStatus({
        data: {
          id: objectId,
          column: "orderStatusCode",
          value: 1024
        }
      })
        .then(res => {
          if (res.code === 1) {
            console.log(res);
            let targetStr = 'orderList['+idx+'].statusStr';
            let targetCode = 'orderList['+idx+'].orderStatusCode';

            that.setData({
              [targetStr]:  '订单已完成',
              [targetCode]:  1024
            }, () => {
              // 更改成功
              Toast({
                type: 'text',
                message: '更改成功'
              });
            })
          } else {
            throw new Error('更改失败');
          }
        })
        .catch(err => {
          Toast({
            type: 'fail',
            message: err.message || '服务器错误'
          });
        })
    }).catch(() => {
      // on cancel
    });
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