const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const jwt = require('jsonwebtoken'); // 引入 jsonwebtoken 库，用于验证 token
const SECRET_KEY = 'your-secret-key'; // 与 login 云函数中使用的密钥保持一致

exports.main = async (event, context) => {
  const { token } = event; // 获取前端传递的 token
  const db = cloud.database();

  try {
    // 验证 token 的有效性
    const decoded = jwt.verify(token, SECRET_KEY);

    // 检查 token 是否存在于数据库中的 session 集合
    const session = await db.collection('sessions').where({
      token: token
    }).get();

    if (session.data.length > 0 && new Date(session.data[0].expiresAt) > new Date()) {
      // 如果 token 有效且未过期，返回用户信息
      return {
        success: true,
        openid: decoded.openid,
        rightId: decoded.rightId,
        userId: decoded.userId,
        username: decoded.username
      };
    } else {
      // 如果 token 不存在或已过期，返回失败
      return {
        success: false,
        message: 'Token is invalid or has expired'
      };
    }
  } catch (err) {
    console.error('Token validation error:', err);
    return {
      success: false,
      message: 'Token validation failed',
      error: err.message
    };
  }
};
