// pages/manage/m-delivery/m-delivery.js
import Toast from '/@vant/weapp/toast/toast';
import Dialog from '/@vant/weapp/dialog/dialog';
const app = getApp();
const getShopInfo = require('../../../utils/getShopInfo');
const initSocket = require('../../../utils/initSocket');
const api = require('../../../request/api');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusType: 'preparation',
    shopId: '',
    prepOrder: [],
    DistOrder: [],
    // 两个 tab页面加载
    loadingPrep: false,
    loadingDist: false,
    // 两个 tab页面页码
    pagePrepIndex: 1,
    pagePrepIndexId: 0,
    pageDistIndex: 1,
    pageDistIndexId: 0,
    // 两个 tab页面到底
    isPrepEnd: false,
    isDistEnd: false,
    newOrderNumber: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.watch$('newOrderNumber', () => {
      console.log('test发生改变');
      this.setData({
        newOrderNumber: app.globalData.newOrderNumber
      })
    })
  },

  // tt() {
  //   console.log('点击tt');
  //   app.globalData.newOrderNumber++;
  // },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    const that = this;
    if (app.globalData.shop) {
      // 直接从全局变量中拿
      that.setData({
        shopId: app.globalData.shop.objectId
      })
      // 建立 ws 连接
      if (app.globalData.localSocket) {
        console.log('ws已经连接');
      } else {
        console.log('ws未连接');
        console.log('app.globalData.shop.userId:', app.globalData.shop.userId);
        initSocket(app.globalData.shop.userId);
      }
      // 根据当前 tabs页，获取不同订单
      that.getOrderList(app.globalData.shop.objectId, that.data.statusType, 1);
    } else {
      getShopInfo()
        .then(res => {
          console.log(res);
          if (res.code === 1) {
            console.log(res.data);
            // 建立 ws 连接
            if (app.globalData.localSocket) {
              console.log('ws已经连接');
            } else {
              console.log('ws未连接');
              initSocket(res.data.userId);
            }
            that.setData({
              shopId: res.data.objectId
            })
            // 根据当前 tabs页，获取不同订单
            that.getOrderList(res.data.objectId, that.data.statusType, 1);
          } 
        })
        .catch(res => {
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
  onReachBottom: function () {
    console.log('上拉触底');
    const that = this;
    let { statusType, shopId } = that.data;
    switch (statusType) {
      case 'preparation':
        let { loadingPrep, isPrepEnd, pagePrepIndex, pagePrepIndexId } = that.data;
        console.log('pageIndex:', pagePrepIndex);
        // 页面赋值之后再让其获取
        // 这里要加一个判断，如果在 loading状态中，则不应该让其继续请求
        // 而且如果 已经 isEnd了，则不应该继续请求
        if (loadingPrep === false && isPrepEnd === false) {
          that.setData({
            pagePrepIndex: pagePrepIndex + 1
          }, that.getOrderList(shopId, 'preparation', pagePrepIndex + 1, pagePrepIndexId))
        }
        break;
      case 'distribution':
        let { loadingDist, isDistEnd, pageDistIndex, pageDistIndexId } = that.data;
        console.log('pageIndex:', pageDistIndex);
        // 页面赋值之后再让其获取
        // 这里要加一个判断，如果在 loading状态中，则不应该让其继续请求
        // 而且如果 已经 isEnd了，则不应该继续请求
        if (loadingDist === false && isDistEnd === false) {
          that.setData({
            pageDistIndex: pageDistIndex + 1
          }, that.getOrderList(shopId, 'distribution', pageDistIndex + 1, pageDistIndexId))
        }
        break;
    
    }
  },


  getOrderList(shopId, type, pageIndex, pageIndexId = 0) {
    let that = this;
    switch (type) {
      case 'preparation':
        that.setData({
          loadingPrep: true,
        })
        if (pageIndex === 1) {
          // 如果获取第一页，就将其全部赋初值
          // 每次新展示的时候都是获取第一页的
          that.setData({
            prepOrder: [],
            pagePrepIndex: 1,
            isPrepEnd: false
          })
          api.manage.getStatusOrder({
            data: {
              page: 1,
              rid: shopId,
              status: 1022
            }
          })
          .then(res => {
            console.log(res);
            let { prepOrder } = this.data;
            let data = res.data;
            if (data.length === 0) {
              // 没有新订单了
              this.setData({
                isPrepEnd: true
              })
            } else {
              // 获取成功，就说明新的订单已经看过了，新订单清 0
              app.globalData.newOrderNumber = 0;
  
              data.map(obj => {
                obj.name = obj.address.split('-')[0];
                obj.phone = obj.address.split('-')[1];
                obj.userAddress = obj.address.split('-')[2];
                obj.dishList = obj.dishList.replace(/-/g, '+');
                obj.dishArr = obj.dishList.split('+');
                obj.priceDel = (obj.priceCount / 100).toFixed(2);
                obj.statusStr = obj.orderPayCode === 0 ? '订单未付款'
                : obj.orderStatusCode === 1022 ? '订单准备中'
                : obj.orderStatusCode === 1023 ? '订单配送中'
                : obj.orderStatusCode === 1024 ? '订单已完成'
                : '状态'
              });
              let newOrderList = [...prepOrder, ...data];
              that.setData({
                prepOrder: newOrderList,
                pagePrepIndexId: data[data.length - 1].id
              }, () => {
                this.tab = this.selectComponent('#tabs');
                this.tab.setData({
                  container: () => this.tab.createSelectorQuery().select('.van-tabs')
                })
              })
            }
  
          })
          .catch(err => {
            Toast({
              type: 'fail',
              message: '获取订单失败'
            });
          })
          .finally(() => {
            that.setData({
              loadingPrep: false
            })
            wx.stopPullDownRefresh();

          })
        } else {

          // 获取的不是第一页时
          api.manage.getMoreStatusOrder({
            data: {
              id: pageIndexId,
              rid: shopId,
              status: 1022
            }
          })
          .then(res => {
            console.log(res);
            let { prepOrder } = this.data;
            let data = res.data;
            if (data.length === 0) {
              // 没有新订单了
              this.setData({
                isPrepEnd: true
              })
            } else {
              // 获取成功，就说明新的订单已经看过了，新订单清 0
              app.globalData.newOrderNumber = 0;
  
              data.map(obj => {
                obj.name = obj.address.split('-')[0];
                obj.phone = obj.address.split('-')[1];
                obj.userAddress = obj.address.split('-')[2];
                obj.dishList = obj.dishList.replace(/-/g, '+');
                obj.dishArr = obj.dishList.split('+');
                obj.priceDel = (obj.priceCount / 100).toFixed(2);
                obj.statusStr = obj.orderPayCode === 0 ? '订单未付款'
                : obj.orderStatusCode === 1022 ? '订单准备中'
                : obj.orderStatusCode === 1023 ? '订单配送中'
                : obj.orderStatusCode === 1024 ? '订单已完成'
                : '状态'
              });
              let newOrderList = [...prepOrder, ...data];
              that.setData({
                prepOrder: newOrderList,
                pagePrepIndexId: data[data.length - 1].id
              }, () => {
                this.tab = this.selectComponent('#tabs');
                this.tab.setData({
                  container: () => this.tab.createSelectorQuery().select('.van-tabs')
                })
              })
            }
  
          })
          .catch(err => {
            Toast({
              type: 'fail',
              message: '获取订单失败'
            });
          })
          .finally(() => {
            that.setData({
              loadingPrep: false
            })
            wx.stopPullDownRefresh();
          })
        }



        break;

      case 'distribution':
        that.setData({
          loadingDist: true,
        })
        if (pageIndex === 1) {
          // 配送中 如果获取第一页，就将其全部赋初值
          // 每次新展示的时候都是获取第一页的
          that.setData({
            DistOrder: [],
            pageDistIndex: 1,
            isDistEnd: false
          })
          api.manage.getStatusOrder({
            data: {
              page: 1,
              rid: shopId,
              status: 1023
            }
          })
          .then(res => {
            console.log(res);
            let { DistOrder } = this.data;
            let data = res.data;
            if (data.length === 0) {
              // 没有新订单了
              this.setData({
                isDistEnd: true
              })
            } else {
              data.map(obj => {
                obj.name = obj.address.split('-')[0];
                obj.phone = obj.address.split('-')[1];
                obj.userAddress = obj.address.split('-')[2];
                obj.dishList = obj.dishList.replace(/-/g, '+');
                obj.dishArr = obj.dishList.split('+');
                obj.priceDel = (obj.priceCount / 100).toFixed(2);
                obj.statusStr = obj.orderPayCode === 0 ? '订单未付款'
                : obj.orderStatusCode === 1022 ? '订单准备中'
                : obj.orderStatusCode === 1023 ? '订单配送中'
                : obj.orderStatusCode === 1024 ? '订单已完成'
                : '状态'
              });
              let newOrderList = [...DistOrder, ...data];
              that.setData({
                DistOrder: newOrderList,
                pageDistIndexId: data[data.length - 1].id
              }, () => {
                this.tab = this.selectComponent('#tabs');
                this.tab.setData({
                  container: () => this.tab.createSelectorQuery().select('.van-tabs')
                })
              })
            }
          })
          .catch(err => {
            Toast({
              type: 'fail',
              message: '获取订单失败'
            });
          })
          .finally(() => {
            that.setData({
              loadingDist: false
            })
            wx.stopPullDownRefresh();
          })
        } else {

          // 配送中 不是第一页时
          api.manage.getMoreStatusOrder({
            data: {
              id: pageIndexId,
              rid: shopId,
              status: 1023
            }
          })
          .then(res => {
            console.log(res);
            let { DistOrder } = this.data;
            let data = res.data;
            if (data.length === 0) {
              // 没有新订单了
              this.setData({
                isDistEnd: true
              })
            } else {
              data.map(obj => {
                obj.name = obj.address.split('-')[0];
                obj.phone = obj.address.split('-')[1];
                obj.userAddress = obj.address.split('-')[2];
                obj.dishList = obj.dishList.replace(/-/g, '+');
                obj.dishArr = obj.dishList.split('+');
                obj.priceDel = (obj.priceCount / 100).toFixed(2);
                obj.statusStr = obj.orderPayCode === 0 ? '订单未付款'
                : obj.orderStatusCode === 1022 ? '订单准备中'
                : obj.orderStatusCode === 1023 ? '订单配送中'
                : obj.orderStatusCode === 1024 ? '订单已完成'
                : '状态'
              });
              let newOrderList = [...DistOrder, ...data];
              that.setData({
                DistOrder: newOrderList,
                pageDistIndexId: data[data.length - 1].id
              }, () => {
                this.tab = this.selectComponent('#tabs');
                this.tab.setData({
                  container: () => this.tab.createSelectorQuery().select('.van-tabs')
                })
              })
            }
          })
          .catch(err => {
            Toast({
              type: 'fail',
              message: '获取订单失败'
            });
          })
          .finally(() => {
            that.setData({
              loadingDist: false
            })
            wx.stopPullDownRefresh();
          })
        }



        break;       
    }

  },

  choseType(event) {
    console.log(event.detail);
    const that = this;
    let type = event.detail.name;
    if (type === 'preparation') {
      that.setData({
        statusType: 'preparation'
      })
      // 获取准备中订单
      that.getOrderList(that.data.shopId, type, 1);
    }

    if (type === 'distribution') {
      that.setData({
        statusType: 'distribution'
      })
      // 获取配送中订单
      that.getOrderList(that.data.shopId, type, 1);
    }
  },

  readyButton(event) {
    console.log(event.target.dataset.idx);
    let { prepOrder } = this.data;
    const that = this;
    let idx = parseInt(event.target.dataset.idx.split('-')[1]);
    let order = prepOrder[idx];
    Dialog.confirm({
      title: '信息',
      message: '确认后订单状态将改为配送中'
    }).then(() => {
      // on confirm
      console.log(order);
      api.manage.updateOrderStatus({
        data: {
          id: order.objectId,
          column: "orderStatusCode",
          value: 1023
        }
      })
        .then(res => {
          if (res.code === 1) {
            
            // 在准备中栏目删除目标
            prepOrder.splice(idx, 1);
            that.setData({
              prepOrder: prepOrder
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
      console.log('取消');
    });
  },

  deliveryReadyButton(event) {
    console.log(event.target.dataset.idx);
    let { DistOrder } = this.data;
    const that = this;
    let idx = parseInt(event.target.dataset.idx.split('-')[1]);
    let order = DistOrder[idx];
    Dialog.confirm({
      title: '信息',
      message: '确认后订单状态将改为已完成'
    }).then(() => {
      // on confirm
      console.log(order);
      api.manage.updateOrderStatus({
        data: {
          id: order.objectId,
          column: "orderStatusCode",
          value: 1024
        }
      })
        .then(res => {
          if (res.code === 1) {
            
            // 在准备中栏目删除目标
            DistOrder.splice(idx, 1);
            that.setData({
              DistOrder: DistOrder
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
      console.log('取消');
    });
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    const that = this;
    if (app.globalData.shop) {
      // 直接从全局变量中拿
      that.setData({
        shopId: app.globalData.shop.objectId
      })
      // 建立 ws 连接
      if (app.globalData.localSocket) {
        console.log('ws已经连接');
      } else {
        console.log('ws未连接');
        console.log('app.globalData.shop.userId:', app.globalData.shop.userId);
        initSocket(app.globalData.shop.userId);
      }
      // 根据当前 tabs页，获取不同订单
      that.getOrderList(app.globalData.shop.objectId, that.data.statusType, 1);
    } else {
      getShopInfo()
        .then(res => {
          console.log(res);
          if (res.code === 1) {
            console.log(res.data);
            // 建立 ws 连接
            if (app.globalData.localSocket) {
              console.log('ws已经连接');
            } else {
              console.log('ws未连接');
              initSocket(res.data.userId);
            }
            that.setData({
              shopId: res.data.objectId
            })
            // 根据当前 tabs页，获取不同订单
            that.getOrderList(res.data.objectId, that.data.statusType, 1);
          } 
        })
        .catch(res => {
          Toast({
            type: 'fail',
            message: '获取店铺失败'
          });
        })
        .finally(() => {
          wx.stopPullDownRefresh();
        })
    }
  },

  jumpOrder(event) {
    console.log(event.currentTarget.dataset.idx);
    let type = event.currentTarget.dataset.idx.split('-')[0];
    let idx = event.currentTarget.dataset.idx.split('-')[1];
    let orderData = [];
    // console.log(type);
    // console.log(idx);
    switch (type) {
      case 'prep':
        orderData = this.data.prepOrder[idx]
        break;
      case 'dist':
        orderData = this.data.DistOrder[idx]
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})