// pages/menu/menu.js
import Toast from '/@vant/weapp/toast/toast';
const api = require('../../request/api');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    shop: {},
    shopId: '',
    shopName: '',
    dish: [],
    //cart: [
    // {
    //   "dishName": "瓦香鸡",
    //   "unitPrice": 11,
    //   "count": 1
    // },
    // {
    //   "dishName": "瓦香培根",
    //   "unitPrice": 12,
    //   "count": 0
    // },
    // {
    //   "dishName": "米饭",
    //   "unitPrice": 1,
    //   "count": 2
    // }]
    cart: [],
    totalPrice: 0,
    addressList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const eventChannel = this.getOpenerEventChannel();
    // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
    eventChannel.on('shopData', (data) => {
      console.log(data);
      let shopId = data.objectId;
      let shopName = data.name;
      let restaurantStatusCode = data.restaurantStatusCode;
      this.setData({
        shop: data,
        shopId: shopId,
        shopName: shopName,
        restaurantStatusCode: restaurantStatusCode
      });
      // 获取当前店铺 菜单列表数据
      api.getList.getUserDishList({
        data: {
          page: 0,
          rid: shopId
        }
      })
      .then(res => {
        console.log(res);
        // 处理 cart数据
        let cart = [];
        res.data.forEach((item, index) => {
          let temp = {
            dishName: item.name,
            unitPrice: item.price,
            count: 0
          }
          cart.push(temp);
        });
        console.log(cart);
        // let dish = res.data;
        // dish.forEach((item) => {
        //   item.count = 0;
        // });
        // console.log(dish);
        this.setData({
          dish: res.data,
          cart: cart
        });
      })
    })
  },

  dishPlus(event) {
    console.log(event.target.dataset.idx);
    let index = event.target.dataset.idx;
    // 修改购买菜品数量
    let newCount = this.data.cart[index].count + 1;
    let cart = this.data.cart;
    cart[index].count = newCount;
    console.log(cart);
    // 修改总价（单位：分）
    let totalPrice = this.data.totalPrice;
    totalPrice = totalPrice + (cart[index].unitPrice * 100);
    this.setData({
      cart: cart,
      totalPrice: totalPrice
    })
  },

  dishReduce(event) {
    console.log(event.target.dataset.idx);
    let index = event.target.dataset.idx;
    // 修改购买菜品数量
    let newCount = this.data.cart[index].count - 1;
    let cart = this.data.cart;
    cart[index].count = newCount;
    console.log(cart);
    // 修改总价（单位：分）
    let totalPrice = this.data.totalPrice;
    totalPrice = totalPrice - (cart[index].unitPrice * 100);
    this.setData({
      cart: cart,
      totalPrice: totalPrice
    })
  },

  orderSubmit() {
    // console.log("111111111111111111111111111111");
    let that = this;
    let dealCart = that.data.cart;
    let results = dealCart.filter(dish => dish.count > 0);
    results.map(item => {
      item.price = (item.count * item.unitPrice).toFixed(2);
    })
    console.log(results);


    if (results.length === 0) {
      Toast({
        type: 'text',
        message: '未选择商品'
      });
    } else {
      wx.navigateTo({
        url: '/pages/payment/payment',
        success(res) {
          // 通过eventChannel向被打开页面传送数据
          let cartData = {
            cart: results,
            totalPrice: that.data.totalPrice,
            shopId: that.data.shopId,
            shopName: that.data.shopName
          }
          res.eventChannel.emit('cartData', cartData);
        }
      })
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