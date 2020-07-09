const http = require('../http');

// 申请店铺
export const applyShop = params => {
  return http({
    url: '/restaurant/save',
    param: params.data,
    method: 'post'
  });
};

// 更新店铺信息
export const updateShop = params => {
  return http({
    url: '/restaurant/updateInfo',
    param: params.data,
    method: 'get'
  });
};

// 更新店铺状态
export const updateShopStatus = params => {
  return http({
    url: '/restaurant/updateStatus',
    param: params.data,
    method: 'get'
  });
};

// 添加店铺菜品
export const saveDish = params => {
  return http({
    url: '/restaurant/dish/save',
    param: params.data,
    method: 'post'
  });
};

// 获取店铺菜品
export const getDishList = params => {
  return http({
    url: '/restaurant/shopper/dish/getRestaurantDishesByRid',
    param: params.data,
    method: 'get'
  });
};

// 更新店铺菜品信息
export const updateDish = params => {
  return http({
    url: '/restaurant/dish/updateInfo',
    param: params.data,
    method: 'get'
  });
};

// 删除店铺菜品
export const deleteDish = params => {
  return http({
    url: '/restaurant/dish/removeRestaurantDishByIdRid',
    param: params.data,
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    method: 'delete'
  });
};

// 商家端获取日订单
export const getDayOrder = params => {
  return http({
    url: '/restaurant/order/getRestaurantOrdersOfDay',
    param: params.data,
    method: 'get'
  });
};

// 商家端获取月订单
export const getMonthOrder = params => {
  return http({
    url: '/restaurant/order/getRestaurantOrdersOfMonth',
    param: params.data,
    method: 'get'
  });
};

// 商家端获取总订单
export const getTotalOrder = params => {
  return http({
    url: '/restaurant/order/getRestaurantOrdersByRid',
    param: params.data,
    method: 'get'
  });
};

// 商家端根据 id获取总订单
export const getMoreTotalOrder = params => {
  return http({
    url: '/restaurant/order/getMoreRestaurantOrdersByRid',
    param: params.data,
    method: 'get'
  });
};

// 商家端 根据状态获取订单列表
export const getStatusOrder = params => {
  return http({
    url: '/restaurant/order/getRestaurantOrdersByStatus',
    param: params.data,
    method: 'get'
  });
};

// 商家端 根据 id,状态获取订单列表
export const getMoreStatusOrder = params => {
  return http({
    url: '/restaurant/order/getMoreRestaurantOrdersByStatus',
    param: params.data,
    method: 'get'
  });
};

// 商家端 更改订单状态
export const updateOrderStatus = params => {
  return http({
    url: '/restaurant/order/updateRestaurantOrderColumn',
    param: params.data,
    method: 'get'
  });
};

module.exports = {
  applyShop,
  updateShop,
  updateShopStatus,
  saveDish,
  getDishList,
  updateDish,
  deleteDish,
  getDayOrder,
  getMonthOrder,
  getTotalOrder,
  getStatusOrder,
  updateOrderStatus,
  getMoreTotalOrder,
  getMoreStatusOrder
}