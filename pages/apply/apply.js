// pages/apply/apply.js
import Toast from '/@vant/weapp/toast/toast';
const wxlogin = require('../../utils/wxlogin');
const api = require('../../request/api');


Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: '',
    desc: '',
    location: '',
    shopType: '',
    show: false,
    showShopType: false,
    // 地址选择选项
    select: [
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
        name: '水果代'
      },
      {
        name: '甜品饮品'
      },
      {
        name: '宿舍小卖部'
      },
      {
        name: '快递代拿'
      }
    ],
    fileList: [
      // {
      //   url: 'https://www.ecanteens.cn/files/images/pjwhOatWsP/554788b0-aa26-4b25-a6b5-006d36d94c42.jpg', 
      //   name: 'shop_img'
      // }
    ],
    userId: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;

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
            that.setData({
              userId: res.userId
            })
          })
          .catch(err => {
            console.log(err);
            if (err === 'getUserInfoErr') {
              // 未授权
              Toast({
                type: 'text',
                message: '登陆后方可申请',
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
  },

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

  // 地址弹出层
  selectLocation(event) {
    this.setData({
      show: true
    });
  },

  closeSheet() {
    this.setData({ show: false });
  },

  choseSelect(event) {
    console.log(event.detail);
    this.setData({
      location: event.detail.name
    });
  },

  // 店铺类别弹出层
  selectShopType(event) {
    this.setData({
      showShopType: true
    });
  },

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
    // let name = this.data.name.replace(/(^\s*)|(\s*$)/g, '');
    // let desc = this.data.desc.replace(/(^\s*)|(\s*$)/g, '');
    // let location = this.data.location;
    // let fileList = this.data.fileList;
    // let userId = this.data.userId;
    let { name, desc, location, shopType, fileList, userId} = this.data;
    // 去除首位空格
    name = name.trim();
    desc = desc.trim();

    if (userId === '') {
      Toast('请先登陆');
    } else if (name === '') {
      Toast('店铺名称不能为空');
    } else if (desc === '') {
      Toast('店铺描述不能为空');
    } else if (location === '') {
      Toast('地址选择不能为空');
    } else if (fileList.length === 0) {
      Toast('店铺图片不能为空');
    } else {
      console.log('申请');
      let reqData = {
        authCode: 0,
        avatar: fileList[0].url,
        createdTime: null,
        description: desc,
        id: null,
        location: location,
        name: name,
        objectId: null,
        restaurantStatusCode: 0,
        titleList: shopType,
        userId: userId
      }
      console.log(reqData);
      api.manage.applyShop({
        data: reqData
      })
        .then(res => {
          console.log(res);
          if (res.code === 1) {
            Toast({
              type: 'text',
              duration: 2000,
              message: '申请成功，请联系相关人员审核',
              onClose: () => {
                console.log('执行OnClose函数');
                wx.navigateBack({
                  delta: 1
                })
              }
            });

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