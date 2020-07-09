// components/ShopCard/ShopCard.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    shop: {
      type: Object,
      value: {},
    },
    islink: {
      type: Boolean,
      value: true
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    jumpShop() {
      if (this.data.islink) {
        let that = this;
        // console.log(that.data.shop);
        wx.navigateTo({
          url: '/pages/menu/menu',
          success(res) {
            // 通过eventChannel向被打开页面传送数据
            res.eventChannel.emit('shopData', that.data.shop);
          }
        })
      }
    }
  }
})
