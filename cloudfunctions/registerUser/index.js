// cloudfunctions/registerUser/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event, context) => {
  const { username, password } = event;

  // 检查是否提供了用户名和密码
  if (!username || !password) {
    return {
      success: false,
      message: '用户名和密码不能为空',
    };
  }

  // 检查用户名是否已存在
  const existingUser = await db.collection('merchants').where({
    username: username,
  }).get();

  if (existingUser.data.length > 0) {
    return {
      success: false,
      message: '用户名已存在',
    };
  }

  // 将新用户信息直接存储到数据库
  try {
    await db.collection('merchants').add({
      data: {
        username: username,
        password: password, // 直接存储明文密码
        createdAt: new Date(),
      },
    });

    return {
      success: true,
      message: '注册成功',
    };
  } catch (error) {
    console.error('用户注册失败：', error);
    return {
      success: false,
      message: '注册失败，请稍后重试',
      error: error.message,
    };
  }
};
