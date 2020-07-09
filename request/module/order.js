const http = require('../http');

// 提交订单
export const saveOrder = params => {
  return http({
    url: '/restaurant/order/save',
    param: params.data,
    // header: {
    //   'content-type': 'application/x-www-form-urlencoded'
    // },
    method: 'post'
  });
};

// 发起支付
export const requestPay = params => {
  return http({
    url: '/wxpay/pay',
    param: params.data,
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    method: 'post'
  });
};

// 发起支付
export const deleteOrder = params => {
  return http({
    url: '/restaurant/order/removeByUid',
    param: params.data,
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    method: 'delete'
  });
};

module.exports =  {
  saveOrder,
  requestPay,
  deleteOrder
}