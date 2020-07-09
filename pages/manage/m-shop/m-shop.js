// pages/manage/m-shop/m-shop.js
import Toast from '/@vant/weapp/toast/toast';
const app = getApp();
// const wxlogin = require('../../../utils/wxlogin');
const getShopInfo = require('../../../utils/getShopInfo');
const api = require('../../../request/api');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    nameOld: '',
    descOld: '',
    name: '',
    desc: '',
    location: '',
    shopType: '',
    showAddress: false,
    showShopType: false,
    // 地址选择选项
    selectAddress: [
      {
        name: '东苑'
      },
      {
        name: '中苑'
      },
      {
        name: '西苑'
      }
    ],
    // 店铺类别选项
    selectShopType: [
      {
        name: '综合'
      },
      {
        name: '清真餐厅'
      },
      {
        name: '甜品饮品'
      },
      {
        name: '宿舍小卖部'
      },
      {
        name: '代拿店铺'
      }
    ],
    fileList: [
      // {
      //   url: 'https://132.232.51.6/files/images/pjwhOatWsP/554788b0-aa26-4b25-a6b5-006d36d94c42.jpg', 
      //   name: 'shop_img'
      // }
    ],
    shopId: '',
    shop: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    if (app.globalData.shop) {
      // 直接从全局变量中拿
      that.setData({
        shopId: app.globalData.shop.objectId,
        nameOld: app.globalData.shop.name,
        descOld: app.globalData.shop.description,
        name: app.globalData.shop.name,
        desc: app.globalData.shop.description,
        location: app.globalData.shop.location,
        shopType: app.globalData.shop.titleList,
        fileList: [{
          url: app.globalData.shop.avatar
        }],
        shop: app.globalData.shop
      })
    } else {
      getShopInfo()
        .then(res => {
          console.log(res);
          if (res.code !== 0) {
            console.log(res.data);
            that.setData({
              shopId: res.data.objectId,
              nameOld: res.data.name,
              descOld: res.data.description,
              name: res.data.name,
              desc: res.data.description,
              location: res.data.location,
              shopType: res.data.titleList,
              fileList: [{
                url: res.data.avatar
              }],
              shop: res.data
            })
          } 
        })
        .catch(err => {
          Toast({
            type: 'fail',
            message: '出现错误',
            duration: 2000,
            onClose: () => {
              console.log('执行OnClose函数');
              wx.navigateBack({
                delta: 1
              })
            }
          });
        })
      // wx.getStorage({
      //   key: 'user',
      //   success(res) {
      //     console.log('拿到 storage');
      //     // console.log(res.data);
      //     console.log(JSON.parse(res.data).userId);
      //     // 设置店铺相关信息
      //     that.setShopInfo(JSON.parse(res.data).userId);
      //   },
      //   fail(res) {
      //     console.log('没有拿到 storage,需要重新登录');
      //     wxlogin()
      //       .then(res => {
      //         console.log(res);
      //         // 设置店铺相关信息
      //         that.setShopInfo(res.userId);
      //       })
      //   }
      // })
    }
  },

  // setShopInfo(userId) {
  //   let that = this;

  //   // 拿到店铺信息
  //   api.user.getUserShop({
  //     userId: userId
  //   })
  //     .then(res => {
  //       console.log(res);
  //       if (res.code !== 0) {
  //         console.log(res.data);
  //         that.setData({
  //           shopId: res.data.objectId,
  //           name: res.data.name,
  //           desc: res.data.description,
  //           location: res.data.location,
  //           fileList: [{
  //             url: res.data.avatar
  //           }],
  //           shop: res.data
  //         })
  //       } 
  //     })
  //     .catch(e => {
  //       Toast({
  //         type: 'fail',
  //         message: '出现错误',
  //         onClose: () => {
  //           console.log('执行OnClose函数');
  //           wx.navigateBack({
  //             delta: 1
  //           })
  //         }
  //       });
  //     })
  // },

  setName(event) {
    console.log(event.detail);
    this.setData({
      name: event.detail
    });
  },

  setDesc(event) {
    console.log(event.detail);
    this.setData({
      desc: event.detail
    });
  },

  selectLocation(event) {
    this.setData({
      showAddress: true
    });
  },

  selectShopType(event) {
    this.setData({
      showShopType: true
    });
  },

  // 地址弹出层
  closeAddressSheet() {
    this.setData({ showAddress: false });
  },

  choseAddressSelect(event) {
    console.log(event.detail);
    this.setData({
      location: event.detail.name
    });
  },

  // 店铺类别弹出层
  closeTypeSheet() {
    this.setData({ showShopType: false });
  },

  choseTypeSelect(event) {
    console.log(event.detail);
    this.setData({
      shopType: event.detail.name
    });
  },
  
  // 图片上传
  afterRead(event) {
    console.log(event.detail);
    const { file } = event.detail;
    let that = this;
    console.log(that.data.shop.userId);

    // 当设置 mutiple 为 true 时, file 为数组格式，否则为对象格式
    wx.uploadFile({
      url: 'https://www.ecanteens.cn/upload', 
      filePath: file.path,
      name: 'file',
      formData: { id: that.data.shop.userId },
      success(res) {
        // 上传完成需要更新 fileList
        console.log(JSON.parse(res.data));

        let fileList = [{
          url: JSON.parse(res.data).data,
          name: file.name
        }];
        that.setData({ 
          fileList: fileList
        });
      },
      fail(err) {
        console.log(err);
      }
    });
  },

  deleteImg(event) {
    console.log(event.detail.index);
    this.setData({
      fileList: []
    })
  },

  // 申请店铺
  saveShop() {
    // {
    //   "authCode": 0,
    //   "avatar": "http://132.232.51.6:8080/files/images/pjwhOatWsP/00f9bdcc-f9d3-4799-bcd2-71c0581f9abe.jpg",
    //   "createdTime": null,
    //   "description": "描述描述描述描述描述描述描述描述描述描述",
    //   "id": null,
    //   "location": "东苑",
    //   "name": "肯德基",
    //   "objectId": null,
    //   "restaurantStatusCode": 0,
    //   "titleList": null,
    //   "userId": "pjwhOatWsP"
    // }
    let { name, desc, location, shopType, fileList, shopId, shop } = this.data;
    // 去除首位空格
    name = name.trim();
    desc = desc.trim();
    // 保存需要更新的参数
    let paramsList = [];

    if (name === '') {
      Toast('店铺名称不能为空');
    } else if (desc === '') {
      Toast('店铺描述不能为空');
    } else if (location === '') {
      Toast('地址选择不能为空');
    } else if (fileList.length === 0) {
      Toast('店铺图片不能为空');
    } else {
      console.log('申请');
      if (name !== shop.name) {
        paramsList.push({
          data: {
            column: 'name',
            id: shopId,
            value: name
          }
        })
      }
      if (desc !== shop.description) {
        paramsList.push({
          data: {
            column: 'description',
            id: shopId,
            value: desc
          }
        })
      }
      if (location !== shop.location) {
        paramsList.push({
          data: {
            column: 'location',
            id: shopId,
            value: location
          }
        })
      }
      if (shopType !== shop.titleList) {
        paramsList.push({
          data: {
            column: 'titleList',
            id: shopId,
            value: shopType
          }
        })
      }
      if (fileList[0].url !== shop.avatar) {
        paramsList.push({
          data: {
            column: 'avatar',
            id: shopId,
            value: fileList[0].url
          }
        })
      }
      console.log(paramsList);
      // 并行 promise请求
      Promise.all(paramsList.map(obj => api.manage.updateShop(obj)))
        .then(res => {
          console.log(res);
          Toast({
            type: 'text',
            message: '更新成功',
            duration: 2000,
            onClose: () => {
              console.log('执行OnClose函数');
              wx.navigateBack({
                delta: 1
              })
            }
          });
        })
        .catch(err => {
          Toast({
            type: 'fail',
            message: '出现错误'
          });
        })
      // api.manage.updateShop({
      //   data: {
      //     column: 'name',
      //     id: shopId,
      //     value: '肯德基'
      //   }
      // })
      // .then(res => {
      //   console.log(res);
      // })
      
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