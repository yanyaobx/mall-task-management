const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const { openid } = event;

  // 打印传入的 openid，确保它是有效的
  console.log('Received openid:', openid); 

  if (!openid) {
    return {
      success: false,
      message: '缺少 openid 参数'
    };
  }

  try {
    // 在 merchants 集合中查询该 openid
    let user = await db.collection('merchants').where({
      openid: openid // 确保 openid 字段存在于数据库中
    }).get();

    console.log('Query result from merchants:', user); // 打印 merchants 集合查询结果以供调试

    if (user.data && user.data.length > 0) {
      // 找到用户，返回用户 ID
      console.log('User found in merchants:', user.data[0].id); 
      return {
        success: true,
        id: user.data[0].id,  // 返回用户的ID
        role: 'merchant' // 角色为商户
      };
    } else {
      // 如果在 merchants 中未找到用户，则在 admins 集合中继续查询
      console.log('User not found in merchants, checking admins collection...');
      user = await db.collection('admins').where({
        openid: openid // 确保 openid 字段存在于 admins 集合中
      }).get();

      console.log('Query result from admins:', user); // 打印 admins 集合查询结果以供调试

      if (user.data && user.data.length > 0) {
        // 找到管理员用户，返回用户 ID
        console.log('User found in admins:', user.data[0].id); 
        return {
          success: true,
          id: user.data[0].id,  // 返回用户的ID
          role: 'admin' // 角色为管理员
        };
      } else {
        // 如果在两个集合中都未找到用户，返回相应消息
        console.log('User not found for openid:', openid);
        return {
          success: false,
          message: '用户未找到'
        };
      }
    }
  } catch (error) {
    // 捕获并打印错误信息
    console.error('Error occurred while fetching user ID:', error); 
    return {
      success: false,
      message: '获取用户ID失败',
      error: error.message  // 返回错误的简短描述
    };
  }
};
