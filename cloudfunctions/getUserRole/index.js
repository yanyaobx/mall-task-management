const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  try {
    // 并行查询 merchants 和 admins 集合
    const [merchantResult, adminResult] = await Promise.all([
      db.collection('merchants').where({ openid }).get(),
      db.collection('admins').where({ openid }).get(),
    ]);

    let role = 'unknown';
    let userId = '';
    let username = '';

    if (merchantResult.data.length > 0) {
      role = 'merchant';
      userId = merchantResult.data[0].id || '';
      username = merchantResult.data[0].username || '';
    } else if (adminResult.data.length > 0) {
      role = 'admin';
      userId = adminResult.data[0].id || '';
      username = adminResult.data[0].username || '';
    }

    return {
      success: true,
      openid: wxContext.OPENID,
      appid: wxContext.APPID,
      unionid: wxContext.UNIONID,
      role,
      userId,
      username,
    };
  } catch (error) {
    console.error('获取用户角色失败:', error);
    return {
      success: false,
      message: '获取用户角色失败',
      error: error.message,
    };
  }
};
