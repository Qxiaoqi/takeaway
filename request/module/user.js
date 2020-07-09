const http = require('../http');

// 登录接口
export const login = params => {
  return http({
    url: '/user/loginMiniProgram',
    param: params.data,
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    method: 'post'
  });
};

// 根据用户 userid获取店铺信息
export const getUserShop = params => {
  return http({
    url: '/restaurant/getRestaurantBySid/' + params.userId,
    param: params.data,
    method: 'get'
  });
};

module.exports =  {
  login,
  getUserShop
}
