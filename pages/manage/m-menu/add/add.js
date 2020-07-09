// pages/manage/m-menu/add/add.js
import Toast from '/@vant/weapp/toast/toast';
const app = getApp();
// const wxlogin = require('../../../../utils/wxlogin');
const getShopInfo = require('../../../../utils/getShopInfo');
const api = require('../../../../request/api');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: '',
    desc: '',
    price: '',
    fileList: [
      // {
      //   url: 'https://www.ecanteens.cn/files/images/pjwhOatWsP/4b443789-810e-4721-bc01-ae6c81b9171d.jpg', 
      //   name: 'dish_img'
      // }
    ],
    shopId: '',
    userId: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this;
    console.log(app.globalData.shop);
    if (app.globalData.shop) {
      // 直接从全局变量中拿
      that.setData({
        shopId: app.globalData.shop.objectId,
        userId: app.globalData.shop.userId
      })
    } else {
      getShopInfo()
        .then(res => {
          console.log(res);
          if (res.code !== 0) {
            console.log(res.data);
            that.setData({
              shopId: res.data.objectId,
              userId: res.data.userId
            })
          } 
        })
        .catch(e => {
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
      //     that.getShopInfo(JSON.parse(res.data).userId);
      //   },
      //   fail(res) {
      //     console.log('没有拿到 storage,需要重新登录');
      //     wxlogin()
      //       .then(res => {
      //         console.log(res);
      //         // 设置店铺相关信息
      //         that.getShopInfo(res.userId);
      //       })
      //   }
      // })
    }
  },

  // 拿到shopId
  // getShopInfo(userId) {
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
  //           shopId: res.data.objectId
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

  setPrice(event) {
    console.log(event.detail);
    this.setData({
      price: event.detail
    });
  },

  // 图片上传
  afterRead(event) {
    console.log(event.detail);
    const { file } = event.detail;
    let that = this;
    console.log(that.data.userId);

    // 当设置 mutiple 为 true 时, file 为数组格式，否则为对象格式
    wx.uploadFile({
      url: 'https://www.ecanteens.cn/upload',
      filePath: file.path,
      name: 'file',
      formData: { id: that.data.userId },
      success(res) {
        // 上传完成需要更新 fileList
        console.log(res);
        let fileList = [{
          url: JSON.parse(res.data).data,
          name: file.name
        }];
        that.setData({ 
          fileList: fileList
        });
        // const { fileList = [] } = this.data;
        // fileList.push({ ...file, url: res.data });
        // this.setData({ fileList });
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

  saveDish() {
    // {
    //   "avatar": String,
    //   "createdTime": null,
    //   "description": String,
    //   "dishStatus": 1,
    //   "id": null,
    //   "kind": "",
    //   "name": String,
    //   "objectId": null,
    //   "price": Number,
    //   "restaurantId": String,
    //   "titleList": ""
    // }
    let { name, desc, price, fileList, shopId} = this.data;
    // 去除首位空格
    name = name.trim();
    desc = desc.trim();

    // price = parseFloat(price);

    if (/[-+]/.test(name)) {
      Toast('菜品名称不能有-或+');
    } else if (name === '') {
      Toast('菜品名称不能为空');
    } else if (desc === '') {
      Toast('菜品描述不能为空');
    } else if (!(/(^[1-9]\d*(\.\d{1,2})?$)|(^0(\.\d{1,2})?$)/.test(price))) {
      Toast('请输入正确的菜品价格');
    } else if (fileList.length === 0) {
      Toast('菜品图片不能为空');
    } else {
      console.log('添加');
      let reqData = {
        avatar: fileList[0].url,
        createdTime: null,
        description: desc,
        dishStatus: 1,
        id: null,
        kind: "",
        name: name,
        objectId: null,
        price: parseFloat(price),
        restaurantId: shopId,
        titleList: ""
      }
      console.log(reqData);
      api.manage.saveDish({
        data: reqData
      })
        .then(res => {
          console.log(res);
          if (res.code === 1) {
            Toast({
              type: 'text',
              message: '添加成功',
              duration: 2000,
              onClose: () => {
                wx.navigateBack({
                  delta: 1
                })
              }
            });
          } else {
            Toast({
              type: 'fail',
              message: '添加失败',
            });
          }
        })
        .catch(err => {
          Toast({
            type: 'fail',
            message: '出现错误',
            duration: 2000,
            onClose: () => {
              wx.navigateBack({
                delta: 1
              })
            }
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