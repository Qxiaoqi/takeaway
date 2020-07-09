const http = require('./http');
const getList = require('./module/getList');
const user = require('./module/user');
const manage = require('./module/manage');
const order = require('./module/order');
const bill = require('./module/bill');


// 获取 多余费用（包装费、餐盒费等）
export const getOtherCost = params => {
  return http({
    url: '/config/restaurantOrder',
    param: params.data,
    method: 'post'
  });
};



module.exports = {
  getList,
  user,
  getOtherCost,
  manage,
  order,
  bill
}