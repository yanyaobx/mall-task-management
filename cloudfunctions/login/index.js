const cloud = require('wx-server-sdk');  
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const jwt = require('jsonwebtoken'); // 引入 jsonwebtoken 库，用于生成和验证 token
const SECRET_KEY = 'your-secret-key'; // 你的密钥，用于加密和解密 token

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext(); // 获取微信上下文，包含 openid
  const db = cloud.database();
  const { username, password, avatarUrl, nickName } = event; // 获取前端传递的参数

  // 打印接收到的用户名和密码
  console.log('云函数接收到的用户名:', username);
  console.log('云函数接收到的密码:', password);
  console.log('云函数接收到的 openid:', wxContext.OPENID);

  try {
    let user = null;
    let rightId = 0;  // 默认角色为普通用户 (rightId = 0)

    // 检查管理员集合
    user = await db.collection('admins').where({
      username: username || '',  
      password: password || ''
    }).get();

    // 打印数据库查询条件和结果
    console.log('查询管理员集合条件:', { username, password });
    console.log('查询管理员集合结果:', user);

    if (user.data.length > 0) {
      // 登录成功，更新头像、昵称和在线状态
      await db.collection('admins').where({
        username: username || ''
      }).update({
        data: {
          avatar: avatarUrl,  // 更新头像
          nickname: nickName, // 更新昵称
          online: true,       // 设置为在线状态
          openid: wxContext.OPENID // 更新用户的 openid
        }
      });

      rightId = 1;  // 管理员角色 (rightId = 1)
    } else {
      // 检查商户集合
      user = await db.collection('merchants').where({
        username: username || '',
        password: password || ''
      }).get();

      // 打印数据库查询条件和结果
      console.log('查询商户集合条件:', { username, password });
      console.log('查询商户集合结果:', user);

      if (user.data.length > 0) {
        // 登录成功，更新头像、昵称和在线状态
        await db.collection('merchants').where({
          username: username || ''
        }).update({
          data: {
            avatar: avatarUrl,  // 更新头像
            nickname: nickName, // 更新昵称
            online: true,       // 设置为在线状态
            openid: wxContext.OPENID // 更新用户的 openid
          }
        });
      } else {
        // 如果用户名和密码不匹配，返回失败
        return {
          success: false,
          message: 'Invalid username or password',
          openid: wxContext.OPENID, // 即使失败也返回 openid 以供调试
        };
      }
    }

    // 生成 token，包含用户的 openid 和角色信息
    const token = jwt.sign(
      {
        openid: wxContext.OPENID,
        rightId: rightId,
        userId: user.data[0]._id, // 用户 ID
        username: username
      },
      SECRET_KEY, // 使用密钥签名
      { expiresIn: '7d' } // token 有效期 7 天
    );

    // 将 token 存储在数据库的 session 集合中，用于验证
    await db.collection('sessions').add({
      data: {
        openid: wxContext.OPENID,
        token: token,
        expiresAt: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000) // 设置过期时间
      }
    });

    // 返回用户信息和生成的 token
    return {
      success: true,
      rightId,  // 返回角色ID，1表示管理员，0表示普通用户
      userInfo: user.data[0], // 返回用户信息
      openid: wxContext.OPENID, // 返回 openid
      appid: wxContext.APPID,
      unionid: wxContext.UNIONID,
      token: token // 返回生成的 token
    };
  } catch (err) {
    console.error('云函数执行错误:', err);
    return {
      success: false,
      message: 'An error occurred while processing your request',
      error: err.message,  // 返回详细错误信息
      openid: wxContext.OPENID,
    };
  }
};
