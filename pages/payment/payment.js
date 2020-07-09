// pages/payment/payment.js
import Toast from '/@vant/weapp/toast/toast';
const api = require('../../request/api');
const wxlogin = require('../../utils/wxlogin');
const promise = require('../../utils/promise');


Page({

  /**
   * 页面的初始数据
   */
  data: {
    show: false,
    shopId: '',
    shopName: '',
    userId: '',
    cart: [],
    totalPrice: 0,
    // 包装费
    packingCharges: 0,
    // 配送费
    distributionFee: 0,
    addressList: {
      arr: [],
      def: ''
    },
    // 选择的地址
    choseAddress: {},
    // 备注
    remark: ''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this;
    const eventChannel = this.getOpenerEventChannel();
    // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
    eventChannel.on('cartData', (cartData) => {
      console.log(cartData);

      // 获取多余费用（配送费、包装费）
      api.getOtherCost({})
        .then(res => {
          console.log(res);
          // let carryFee = res.data.carryFee;
          let packingCharges = res.data.coverCost;


          // 此处测试原因，后面上线时将注释去掉
          let distributionFee = res.data.carryCost;
          // let distributionFee = 0;



          // 包含包装费的情况
          // let totalPrice = cartData.totalPrice + packingCharges * 100 + distributionFee * 100;
          // 目前只包含配送费
          let totalPrice = cartData.totalPrice + distributionFee * 100;
          this.setData({
            packingCharges: packingCharges,
            distributionFee: distributionFee,
            totalPrice: totalPrice,
            cart: cartData.cart,
            shopId: cartData.shopId,
            shopName: cartData.shopName
          });
        })
    })

    wx.getStorage({
      key: 'user',
      success(res) {
        console.log('拿到 storage');
        // console.log(res.data);
        console.log(JSON.parse(res.data).userId);
        that.setData({
          userId: JSON.parse(res.data).userId
        })
      },
      fail(res) {
        console.log('没有拿到 storage,需要重新登录');
        wxlogin()
          .then(res => {
            console.log(res);
            // 设置店铺相关信息
            that.setData({
              userId: res.userId
            })
          })
          .catch(err => {
            if (err === 'getUserInfoErr') {
              // 未授权
              Toast({
                type: 'text',
                message: '登陆后方可下单',
                duration: 2000,
                onClose: () => {
                  console.log('执行OnClose函数');
                  wx.switchTab({
                    url: '/pages/user/user'
                  })
                }
              });
            } else {
              Toast({
                type: 'fail',
                message: '未获取到用户信息'
              });
            }
          })
      }
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 获取地址 storage
    let that = this;
    wx.getStorage({
      key: 'addressList',
      success (res) {
        console.log(JSON.parse(res.data));
        let addressObj = JSON.parse(res.data);
        that.setData({
          addressList: addressObj,
          choseAddress: addressObj.arr[addressObj.def]
        });
      }
    })
  },

  showSheet() {
    this.setData({
      show: true
    })
  },

  addressClose() {
    this.setData({ show: false });
  },

  choseAddress(event) {
    console.log(event.currentTarget.dataset.idx);
    let addressList = this.data.addressList;
    this.setData({ 
      show: false,
      choseAddress: addressList.arr[event.currentTarget.dataset.idx]
    });

  },

  remarkInput(event) {
    console.log(event.detail);
    this.setData({
      remark: event.detail
    });
  },

  paySubmit() {
    // {
    //   "address": "收件人-15751893690-南京信息工程大学沁园25栋",
    //   "arrivedTime": null,
    //   "carryPrice": 1.5,
    //   "carryWay": "商家配送",
    //   "createdTime": null,
    //   "dishList": "金牌瓦香鸡-米饭",
    //   "id": null,
    //   "objectId": null,
    //   "orderCode": null,
    //   "orderPayCode": 0,
    //   "orderStatusCode": 0,
    //   "priceCount": 13,
    //   "remark": "备注",
    //   "restaurantId": "622E1tE36t",
    //   "shopperStatus": null,
    //   "userId": "pjwhOatWsP",
    //   "userStatus": 0
    // }
    let { userId, shopId, choseAddress, distributionFee, cart, totalPrice, remark } = this.data;
    let address = `${choseAddress.name}-${choseAddress.phone}-${choseAddress.address}`;
    let dishListArr = [];
    for (let i = 0; i < cart.length; i++) {
      for (let j = 0; j < cart[i].count; j++) {
        dishListArr.push(cart[i].dishName);
      }
    }
    let dishListStr = dishListArr.join('-');
    // 以分为单位  即小数点后两位
    let priceCount = totalPrice;


    console.log(userId);
    console.log(choseAddress);
    console.log(distributionFee);
    console.log(dishListStr);
    console.log(priceCount);


    if (!userId) {
      Toast({
        type: 'fail',
        message: '未获取到用户信息'
      });
    } else if (!Object.keys(choseAddress).length) {
      Toast({
        type: 'text',
        message: '请选择地址'
      });
    } else if (distributionFee === '') {
      Toast({
        type: 'fail',
        message: '未获取到配送费'
      });
    } else if (dishListStr === '') {
      Toast({
        type: 'fail',
        message: '未获取到菜品'
      });
    } else if (priceCount === '') {
      Toast({
        type: 'fail',
        message: '未获取到价格'
      });
    } else {
      let reqData = {
        address: address,
        arrivedTime: null,
        carryPrice: parseFloat(distributionFee),
        carryWay: "商家配送",
        createdTime: null,
        dishList: dishListStr,
        id: null,
        objectId: null,
        orderCode: null,
        orderPayCode: 0,  // 未付款传 0，已付款传 1
        orderStatusCode: 1022,  // 准备中：1022，配送中：1023，已完成：1024
        priceCount: priceCount,
        remark: remark,
        restaurantId: shopId,
        shopperStatus: 0,
        userId: userId,
        userStatus: 0   // 默认为 0，删除订单为 1
      }
      console.log(reqData);
      // 支付用到的订单号
      let orderCode;
      // 删除用的订单 id
      let orderId;

      // 提交订单
      api.order.saveOrder({
        data: reqData
      })
        .then(res => {
          console.log(res);
          if (res.code === 1) {
            console.log('发起支付');
            orderCode = res.data.orderCode;
            orderId = res.data.objectId;
            console.log(orderCode);
            // wx.login() 获取 code
            return promise.login();
          }
        })
        .then(res => {
          // 说明已经拿到了 临时code
          console.log(res);
          // 发起支付请求
          return api.order.requestPay({
            data: {
              code: res.code,
              priceCount: priceCount,
              orderCode: orderCode
            }
          })
            // Toast({
            //   type: 'fail',
            //   message: '获取用户信息失败'
            // });
        })
        .then(res => {
          // 支付结果
          console.log(res);
          if (res.code === 1) {
            // 发起支付
            let data = JSON.parse(res.data);
            console.log(data);

            wx.requestPayment({
              timeStamp: data.timeStamp,
              nonceStr: data.nonceStr,
              package: data.package,
              signType: data.signType,
              paySign: data.paySign,
              success (res) { 
                console.log(res);
                // {errMsg: "requestPayment:ok"}
                // 支付成功，跳转到成功页面
                wx.redirectTo({
                  url: '/pages/payment/success/success'
                })
              },
              fail (res) {
                console.log(res);
                Toast({
                  type: 'fail',
                  message: '订单已取消'
                });
                // 将订单删除，不保存没有支付过的订单
                api.order.deleteOrder({
                  data: {
                    id: orderId,
                    uid: userId
                  }
                })
                  .then(res => {
                    console.log('删除订单:', res);
                    if (res.code === 0) {
                      // 订单没有删除成功
                      throw new Error('删除订单失败');
                    }
                  })
              }
            })
          } else {
            throw new Error('请求支付失败');
          }
        })
        .catch(err => {
          Toast({
            type: 'fail',
            message: err.message || '提交订单失败'
          });
        })
    }
    
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