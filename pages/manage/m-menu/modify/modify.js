// pages/manage/m-menu/modify/modify.js
import Toast from '/@vant/weapp/toast/toast';
import Dialog from '/@vant/weapp/dialog/dialog';
const api = require('../../../../request/api');
const wxlogin = require('../../../../utils/wxlogin');


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
    userId: '',
    dishId: '',
    oldDish: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    const eventChannel = this.getOpenerEventChannel();
    // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
    eventChannel.on('dishData', (data) => {
      console.log(data);
      this.setData({
        name: data.name,
        desc: data.description,
        price: data.price,
        fileList: [
          {
            url: data.avatar
          }
        ],
        shopId: data.restaurantId,
        dishId: data.objectId,
        oldDish: data
      });

    })

    // 获取 userId
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

  // 修改菜品
  modifyDish() {
    let { name, desc, price, fileList, dishId, oldDish} = this.data;
    // 去除首位空格
    name = name.trim();
    desc = desc.trim();

    // 保存需要更新的参数
    let paramsList = [];

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
      if (name !== oldDish.name) {
        paramsList.push({
          data: {
            column: 'name',
            id: dishId,
            value: name
          }
        })
      }
      if (desc !== oldDish.description) {
        paramsList.push({
          data: {
            column: 'description',
            id: dishId,
            value: desc
          }
        })
      }
      if (parseFloat(price) !== oldDish.price) {
        paramsList.push({
          data: {
            column: 'price',
            id: dishId,
            value: parseFloat(price)
          }
        })
      }
      if (fileList[0].url !== oldDish.avatar) {
        paramsList.push({
          data: {
            column: 'avatar',
            id: dishId,
            value: fileList[0].url
          }
        })
      }
      console.log(paramsList);
      // 并行 promise请求
      Promise.all(paramsList.map(obj => api.manage.updateDish(obj)))
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

    }
  },

  deleteDish() {
    let { shopId ,dishId } = this.data;
    Dialog.confirm({
      title: '警告',
      message: '是否要删除该菜品'
    }).then(() => {
      // on confirm
      console.log('删除操作');
      api.manage.deleteDish({
        data: {
          id: dishId,
          rid: shopId
        }
      })
        .then(res => {
          if (res.code === 1) {
            // 删除成功
            Toast({
              type: 'text',
              message: '删除成功',
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
              message: '删除失败'
            });
          }
        })
        .catch(err => {
          Toast({
            type: 'fail',
            message: '服务器错误'
          });
        })
    }).catch(() => {
      // on cancel
      console.log('取消');
    });
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