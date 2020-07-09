const http = require('../http');


// 根据 location获取店铺列表
export const getLocationShop = params => {
  return http({
    url: '/restaurant/getRestaurantsByLocation/' + params.location,
    param: params.data,
    method: 'get'
  });
};

// 获取 餐厅 店铺列表
export const getTypeShop = params => {
  return http({
    url: '/restaurant/getRestaurantsByTitle/title',
    param: params.data,
    method: 'get'
  });
};

// 获取 用户订单
export const getUserOrderList = params => {
  return http({
    url: '/restaurant/order/getRestaurantOrdersByUid',
    param: params.data,
    method: 'get'
  });
};

// 获取 菜单列表
export const getUserDishList = params => {
  return http({
    url: '/restaurant/user/dish/getRestaurantDishesByRid',
    param: params.data,
    method: 'get'
  });
};

module.exports =  {
  getLocationShop,
  getTypeShop,
  getUserOrderList,
  getUserDishList
}
