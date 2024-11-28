const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const db = cloud.database();

  try {
    // 更新用户的在线状态为 false
    await db.collection('merchants').where({
      openid: wxContext.OPENID
    }).update({
      data: {
        online: false // 设置为离线状态
      }
    });

    await db.collection('admins').where({
      openid: wxContext.OPENID
    }).update({
      data: {
        online: false // 设置为离线状态
      }
    });

    return {
      success: true,
      message: '用户已成功登出'
    };
  } catch (err) {
    console.error('更新 online 状态失败:', err);
    return {
      success: false,
      message: '登出失败',
      error: err.message
    };
  }
};
