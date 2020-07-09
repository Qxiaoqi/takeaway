import Toast from '/@vant/weapp/toast/toast';
const UPNG = require('../utils/UPNG');
const app = getApp();

const PrinterJobs = require('../printer/printerjobs');
const printerUtil = require('../printer/printerutil');

const initSocket = (userId) => {
  const toast = Toast.loading({
    duration: 0,       // 持续展示 toast
    forbidClick: true, // 禁用背景点击
    message: '连接中'
  });
  // 存储音频
  if (!app.globalData.audio) {
    app.globalData.audio = wx.createInnerAudioContext();
    app.globalData.audio.src = '/audio/audio.mp3';
  }
  // 测试 url后面要改到 onshow里
  app.globalData.localSocket = wx.connectSocket({
    url: 'wss://www.ecanteens.cn/websocket/' + userId,
    success(res) {
      console.log('连接成功:', res);
    },
    fail(res) {
      console.log('连接失败:', res);
    }
  })
  app.globalData.localSocket.onOpen((res) => {
    Toast.clear();
    console.log('onOpen:', app.globalData.localSocket);
  })
  app.globalData.localSocket.onMessage((res) => {
    Toast.clear();
    console.log('onMessage:', res);
    console.log('app.globalData.newOrderNumber:', app.globalData.newOrderNumber);
    if (res.data && res.data.split('-', 2)[0] === 'print') {
      console.log('新订单产生');
      app.globalData.newOrderNumber++;
      console.log(res.data);

      // 这里不需要这一段代码
      // 需要改成监听 app变化，然后对应页面 onshow里监听同时做出相应改动
      // this.setData({
      //   newOrderNumber: app.globalData.newOrderNumber
      // })
      app.globalData.audio.play();
      writeBLECharacteristicValue(res.data);
    }
  })
  app.globalData.localSocket.onError((res) => {
    Toast.clear();
    console.log('onError:', res);
    initSocket();
  })
  app.globalData.localSocket.onClose((res) => {
    console.log('onClose:', res);
    // 中间关闭的话，会在这里回调吗？
    // 如果在这里回调的话，需要加上一个重新调用
  })
}

const writeBLECharacteristicValue = (resData) => {
  // 处理返回数据
  let imgUrl = resData.split(/-{[^]+}-/g)[1];
  let jsonMatch = resData.match(/-{[^]+}-/g)[0];
  let json = JSON.parse(jsonMatch.substring(1, jsonMatch.length - 1));
  let dishArr = json.dishList.split('-');
  console.log(imgUrl);
  console.log(json);
  // let arr = convert4to1(res.data);
  // let data = convert8to1(arr);
  // console.log(data);
  wx.request({
    url: 'https://' + imgUrl,
    responseType: 'arrayBuffer',
    success (res) {
      // console.log(res.data);
      let rgbaArray = UPNG.toRGBA8(UPNG.decode(res.data))[0];
      // console.log(rgbaArray);
      let rgbaUnitArray = Array.prototype.slice.call(new Uint8Array(rgbaArray));
      let arr = convert4to1(rgbaUnitArray);
      let data = convert8to1(arr);
      console.log(data);
      // 店铺名称？
      // orderPayCode为什么是 0 ？
      
      let printerJobs = new PrinterJobs();
      printerJobs
        // .print('2020年4月20日17:34')
        // .print(printerUtil.fillLine())
        .setAlign('ct')
        .setSize(2, 2)
        .print('#20南信大代餐')
        .setSize(1, 1)
        // .print('店铺名称')
        .print('商家配送')
        .setSize(2, 2)
        .print('在线支付(已支付)')
        .setSize(1, 1)
        .print('单号：' + json.orderCode)
        .print('下单时间：' + json.createdTime)
        .setAlign('lt')
        .print(printerUtil.fillAround('点餐'))
        .printDishArr(dishArr)
        // .print(printerUtil.inline('波纹薯条 * 1', '15'))
        .print(printerUtil.fillAround('其他'))
        .print(printerUtil.inline('餐盒费+配送费', '' + json.carryPrice))
        // .print('餐盒费+配送费：￥' + json.carryPrice)
        // .print('[赠送康师傅冰红茶] * 1')
        .print(printerUtil.fillLine())
        .setAlign('rt')
        // .print('原价：￥16')
        .print('总价：￥' + (json.priceCount / 100).toFixed(2))
        .setAlign('lt')
        .print(printerUtil.fillLine())
        .print('备注')
        .print("" + json.remark)
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
        setTimeout(_writeBLECharacteristicValue, 0, subPackage);
      }
    },
    fail (err) {
      console.log("二维码图片没获取到");
      console.log(err);
    }
  })

}

const _writeBLECharacteristicValue = (buffer) => {
  wx.writeBLECharacteristicValue({
    deviceId: app.globalData.print_deviceId,
    serviceId: app.globalData.print_serviceId,
    characteristicId: app.globalData.print_characteristicId,
    value: buffer,
    success(res) {
      console.log('writeBLECharacteristicValue success', res)
    },
    fail(res) {
      console.log('writeBLECharacteristicValue fail', res)
    }
  })
}

// ArrayBuffer转16进度字符串示例
function ab2hex(buffer) {
  const hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function (bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  return hexArr.join(',')
}

//4合1 
function convert4to1(res) {
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
}

//8合1
function convert8to1(arr) {
  let data = [];
  for (let k = 0; k < arr.length; k += 8) {
    let temp = arr[k] * 128 + arr[k + 1] * 64 + arr[k + 2] * 32 + arr[k + 3] * 16 + arr[k + 4] * 8 + arr[k + 5] * 4 + arr[k + 6] * 2 + arr[k + 7] * 1
    data.push(temp);
  }
  return data;
}

module.exports = initSocket;
