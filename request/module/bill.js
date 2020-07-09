const http = require('../http');

// 获取店铺日订单金额
export const getDayBill = params => {
  return http({
    url: '/pay/getPayCountByRestaurantIdOfDay',
    param: params.data,
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    method: 'post'
  });
};

// 获取店铺月订单金额
export const getMonthBill = params => {
  return http({
    url: '/pay/getPayCountByRestaurantIdOfMonth',
    param: params.data,
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    method: 'post'
  });
};

module.exports = {
  getDayBill,
  getMonthBill
}