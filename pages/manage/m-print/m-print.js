// pages/manage/m-print/m-print.js
const UPNG = require('../../../utils/UPNG')
const app = getApp();

const LAST_CONNECTED_DEVICE = 'last_connected_device'
const PrinterJobs = require('../../../printer/printerjobs')
const printerUtil = require('../../../printer/printerutil')

function inArray(arr, key, val) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][key] === val) {
      return i
    }
  }
  return -1
}

// ArrayBuffer转16进制字符串示例
function ab2hex(buffer) {
  const hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function (bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  return hexArr.join(',')
}

function str2ab(str) {
  // Convert str to ArrayBuff and write to printer
  let buffer = new ArrayBuffer(str.length)
  let dataView = new DataView(buffer)
  for (let i = 0; i < str.length; i++) {
    dataView.setUint8(i, str.charAt(i).charCodeAt(0))
  }
  return buffer;
}


Page({

  /**
   * 页面的初始数据
   */
  data: {
    devices: [],
    connected: false,
    chs: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const lastDevice = wx.getStorageSync(LAST_CONNECTED_DEVICE);
    console.log("onload:", app.globalData.printConnected);
    // console.log("onload connected page:", this.data.connected);

    this.setData({
      lastDevice: lastDevice,
      connected: app.globalData.printConnected,
      canWrite : app.globalData.printCanWrite,
      deviceId: app.globalData.printDeviceId
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  onUnload() {
    // this.closeBluetoothAdapter()
  },
  openBluetoothAdapter() {
    if (!wx.openBluetoothAdapter) {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
      return
    }
    wx.openBluetoothAdapter({
      success: (res) => {
        console.log('openBluetoothAdapter success', res)
        this.startBluetoothDevicesDiscovery()
      },
      fail: (res) => {
        console.log('openBluetoothAdapter fail', res)
        if (res.errCode === 10001) {
          wx.showModal({
            title: '错误',
            content: '未找到蓝牙设备, 请打开蓝牙后重试。',
            showCancel: false
          })
          wx.onBluetoothAdapterStateChange((res) => {
            console.log('onBluetoothAdapterStateChange', res)
            if (res.available) {
              // 取消监听，否则stopBluetoothDevicesDiscovery后仍会继续触发onBluetoothAdapterStateChange，
              // 导致再次调用startBluetoothDevicesDiscovery
              wx.onBluetoothAdapterStateChange(() => {
              });
              this.startBluetoothDevicesDiscovery()
            }
          })
        }
      }
    })
    wx.onBLEConnectionStateChange((res) => {
      // 该方法回调中可以用于处理连接意外断开等异常情况
      console.log('onBLEConnectionStateChange', `device ${res.deviceId} state has changed, connected: ${res.connected}`)
      app.globalData.printConnected = res.connected;
      this.setData({
        connected: res.connected
      })
      if (!res.connected) {
        wx.showModal({
          title: '错误',
          content: '蓝牙连接已断开',
          showCancel: false
        })
      }
    });
  },
  getBluetoothAdapterState() {
    wx.getBluetoothAdapterState({
      success: (res) => {
        console.log('getBluetoothAdapterState', res)
        if (res.discovering) {
          this.onBluetoothDeviceFound()
        } else if (res.available) {
          this.startBluetoothDevicesDiscovery()
        }
      }
    })
  },
  startBluetoothDevicesDiscovery() {
    console.log("_discoveryStarted:", this._discoveryStarted);
    if (this._discoveryStarted) {
      return
    }
    this._discoveryStarted = true
    wx.startBluetoothDevicesDiscovery({
      success: (res) => {
        console.log('startBluetoothDevicesDiscovery success', res)
        this.onBluetoothDeviceFound()
      },
      fail: (res) => {
        console.log('startBluetoothDevicesDiscovery fail', res)
      }
    })
  },
  stopBluetoothDevicesDiscovery() {
    wx.stopBluetoothDevicesDiscovery({
      complete: () => {
        console.log('stopBluetoothDevicesDiscovery')
        this._discoveryStarted = false
      }
    })
  },
  onBluetoothDeviceFound() {
    wx.onBluetoothDeviceFound((res) => {
      res.devices.forEach(device => {
        if (!device.name && !device.localName) {
          return
        }
        const foundDevices = this.data.devices
        const idx = inArray(foundDevices, 'deviceId', device.deviceId)
        const data = {}
        if (idx === -1) {
          data[`devices[${foundDevices.length}]`] = device
        } else {
          data[`devices[${idx}]`] = device
        }
        app.globalData.printData = data;
        console.log("找到新的设备：", data);
        this.setData(data)
      })
    })
  },
  createBLEConnection(e) {
    const ds = e.currentTarget.dataset
    const deviceId = ds.deviceId
    const name = ds.name
    this._createBLEConnection(deviceId, name)
  },
  _createBLEConnection(deviceId, name) {
    wx.showLoading()
    wx.createBLEConnection({
      deviceId,
      success: () => {
        console.log('createBLEConnection success');
        app.globalData.print = {
          connected: true,
          name,
          deviceId
        }
        app.globalData.printConnected = true;
        app.globalData.printName = name;
        app.globalData.printDeviceId = deviceId;

        this.setData({
          connected: true,
          name,
          deviceId,
        })
        this.getBLEDeviceServices(deviceId)
        wx.setStorage({
          key: LAST_CONNECTED_DEVICE,
          data: name + ':' + deviceId
        })
      },
      complete() {
        wx.hideLoading()
      },
      fail: (res) => {
        console.log('createBLEConnection fail', res)
      }
    })
    this.stopBluetoothDevicesDiscovery()
  },
  closeBLEConnection() {
    wx.closeBLEConnection({
      deviceId: this.data.deviceId
    })
    app.globalData.printConnected = false;
    app.globalData.printChs = [];
    app.globalData.printCanWrite = false;

    this.setData({
      connected: false,
      chs: [],
      canWrite: false,
    })
  },
  getBLEDeviceServices(deviceId) {
    wx.getBLEDeviceServices({
      deviceId,
      success: (res) => {
        console.log('getBLEDeviceServices', res)
        for (let i = 0; i < res.services.length; i++) {
          if (res.services[i].isPrimary) {
            this.getBLEDeviceCharacteristics(deviceId, res.services[i].uuid)
            return
          }
        }
      },
      fail: (err) => {
        console.log(err);
      }
    })
  },
  getBLEDeviceCharacteristics(deviceId, serviceId) {
    wx.getBLEDeviceCharacteristics({
      deviceId,
      serviceId,
      success: (res) => {
        console.log('getBLEDeviceCharacteristics success', res.characteristics)
        // 这里会存在特征值是支持write，写入成功但是没有任何反应的情况
        // 只能一个个去试
        for (let i = 0; i < res.characteristics.length; i++) {
          const item = res.characteristics[i]
          if (item.properties.write) {
            app.globalData.printCanWrite = true;
            app.globalData.print_deviceId = deviceId;
            app.globalData.print_serviceId = serviceId;
            app.globalData.print_characteristicId = item.uuid;

            this.setData({
              canWrite: true
            })
            this._deviceId = deviceId
            this._serviceId = serviceId
            this._characteristicId = item.uuid
            break;
          }
        }
      },
      fail(res) {
        console.error('getBLEDeviceCharacteristics', res)
      }
    })
  },
  writeBLECharacteristicValue() {
    let that = this;
    wx.request({
      url: 'https://www.ecanteens.cn/files/images/pjwhOatWsP/95d0f813-2f85-4816-9fa3-58470f416a87.png',
      responseType: 'arrayBuffer',
      success(res) {
        console.log(res.data);
        let rgbaArray = UPNG.toRGBA8(UPNG.decode(res.data))[0];
        console.log(rgbaArray);
        let rgbaUnitArray = Array.prototype.slice.call(new Uint8Array(rgbaArray));
        // console.log("res.data:", res.data);
        // 由于canvasGetImageData的返回值为 像素点的数据，格式为数组
        // 每4项代表RGBA
        // 先将RGBA的图转称 灰度图，灰度图的 R=G=B，不用考虑 A透明度
        // 而且由于人眼的对RGB的颜色接受程度不同，因此比例不是 1/3，而是略有差异
        // 0.29900 * res[i] + 0.58700 * res[i + 1] + 0.11400 * res[i + 2]，小数即为不同颜色的比例
        // 然后再将灰度图 二值化（转成黑白两色的图）这里阈值设置为200
        // 转成 黑白图的原因是，二维码只有黑白两色，所以不需要多于数据，减少数据的传输
        // 黑白图只需要 0或者1，而灰度图则是0-255之间
        // 灰度图一个像素点占用 1个字节
        let arr = that.convert4to1(rgbaUnitArray);
        // 二值化后，一个字节是 8个bit，一个像素点占用一个bit
        // 一个子节代表 8个像素点，因此需要8转1
        let data = that.convert8to1(arr);
        console.log(data);
        // 这个是 打印机指令
        // [27, 97, 1]代表中间对齐

        // [29, 118, 48,    0,     20,                   0,       160,                 0]代表打印光栅位图，
        // 29   118  48  正常模式  xL水平方向位图字节数   xH*256    yL垂直方向位图点数    yH*256
        // 即 打印 160*160 大小的光栅位图

        // [27, 74, 3] 打印机走纸
        let printerJobs = new PrinterJobs();
        printerJobs
          .print('2020年4月20日17:34')
          .print(printerUtil.fillLine())
          .setAlign('ct')
          .setSize(2, 2)
          .print('#20南信大代餐')
          .setSize(1, 1)
          .print('店铺名称')
          .setSize(2, 2)
          .print('在线支付(已支付)')
          .setSize(1, 1)
          .print('订单号：5415221202244734')
          .print('下单时间：2020-04-07 18:08:08')
          .setAlign('lt')
          .print(printerUtil.fillAround('点餐'))
          .print(printerUtil.inline('波纹薯条 * 1', '15'))
          .print(printerUtil.fillAround('其他'))
          .print(printerUtil.inline('餐盒费+配送费', '1'))
          // .print('餐盒费：1')
          // .print('[赠送康师傅冰红茶] * 1')
          .print(printerUtil.fillLine())
          .setAlign('rt')
          // .print('原价：￥16')
          .print('总价：￥16')
          .setAlign('lt')
          .print(printerUtil.fillLine())
          .print('备注')
          .print("无")
          .print(printerUtil.fillLine())
          .drawQR(data)
          .lineFeed()
          .lineFeed()
          .println();

        let buffer = printerJobs.buffer();
        console.log('ArrayBuffer', 'length: ' + buffer.byteLength, ' hex: ' + ab2hex(buffer));
        // 1.并行调用多次会存在写失败的可能性
        // 2.建议每次写入不超过20字节
        // 分包处理，延时调用
        const maxChunk = 20;
        const delay = 20;
        for (let i = 0, j = 0, length = buffer.byteLength; i < length; i += maxChunk, j++) {
          let subPackage = buffer.slice(i, i + maxChunk <= length ? (i + maxChunk) : length);
          setTimeout(that._writeBLECharacteristicValue, 0, subPackage, j);
        }
      },
      fail(err) {
        console.log(err);
      }
    })
  },
  _writeBLECharacteristicValue(buffer, id) {
    // console.log(id);
    wx.writeBLECharacteristicValue({
      deviceId: app.globalData.print_deviceId,
      serviceId: app.globalData.print_serviceId,
      characteristicId: app.globalData.print_characteristicId,
      value: buffer,
      success(res) {
        console.log('writeBLECharacteristicValue success', res, id)
      },
      fail(res) {
        console.log('writeBLECharacteristicValue fail', res)
      }
    })
  },
  closeBluetoothAdapter() {
    wx.closeBluetoothAdapter()
    this._discoveryStarted = false
  },
  createBLEConnectionWithDeviceId(e) {
    // 小程序在之前已有搜索过某个蓝牙设备，并成功建立连接，可直接传入之前搜索获取的 deviceId 直接尝试连接该设备
    const device = this.data.lastDevice
    if (!device) {
      return
    }
    const index = device.indexOf(':');
    const name = device.substring(0, index);
    const deviceId = device.substring(index + 1, device.length);
    console.log('createBLEConnectionWithDeviceId', name + ':' + deviceId)
    wx.openBluetoothAdapter({
      success: (res) => {
        console.log('openBluetoothAdapter success', res)
        this._createBLEConnection(deviceId, name)
      },
      fail: (res) => {
        console.log('openBluetoothAdapter fail', res)
        if (res.errCode === 10001) {
          wx.showModal({
            title: '错误',
            content: '未找到蓝牙设备, 请打开蓝牙后重试。',
            showCancel: false
          })
          wx.onBluetoothAdapterStateChange((res) => {
            console.log('onBluetoothAdapterStateChange', res)
            if (res.available) {
              // 取消监听
              wx.onBluetoothAdapterStateChange(() => {
              });
              this._createBLEConnection(deviceId, name)
            }
          })
        }
      }
    })
  },
  //4合1 
  convert4to1(res) {
    let arr=[];
    for (let i = 0; i < res.length; i++) {
      if (i % 4 == 0) {
        let rule = 0.29900 * res[i] + 0.58700 * res[i + 1] + 0.11400 * res[i + 2];
        if (rule > 200) {
          res[i] = 0;
        } else {
          res[i] = 1;
        }
        arr.push(res[i]);
      }
    }
    return arr;
  },

  //8合1
  convert8to1(arr) {
    let data = [];
    for (let k = 0; k < arr.length; k += 8) {
      let temp = arr[k] * 128 + arr[k + 1] * 64 + arr[k + 2] * 32 + arr[k + 3] * 16 + arr[k + 4] * 8 + arr[k + 5] * 4 + arr[k + 6] * 2 + arr[k + 7] * 1
      data.push(temp);
    }
    return data;
  },
})