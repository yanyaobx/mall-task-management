const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext(); // 获取当前用户的 openid
  const { includeSelf = true, role } = event; // 通过前端传递角色参数 role

  console.log('当前用户 openid:', wxContext.OPENID);
  console.log('用户角色:', role); // 打印用户角色

  try {
    // 根据角色选择查询的集合
    let collectionName = role === 'admin' ? 'admins' : 'merchants';
    console.log('查询集合名称:', collectionName); // 打印使用的集合名称

    // 构建查询条件
    let query = { online: true };

    if (!includeSelf) {
      // 如果不包含自己，排除当前用户的 openid
      query.openid = db.command.neq(wxContext.OPENID);
    }

    // 打印查询条件以确认是否正确构建
    console.log('构建的查询条件:', query);

    // 执行查询在线用户
    const onlineUsers = await db.collection(collectionName).where(query).field({
      avatar: true,  // 获取 avatar 字段 (微信头像)
      id: true,      // 获取 id 字段（用作显示）
      openid: true   // 保留 openid 字段，供前端识别用户
    }).get();

    // 打印查询结果
    console.log('查询结果 onlineUsers:', onlineUsers.data);

    // 如果没有在线用户，打印警告
    if (onlineUsers.data.length === 0) {
      console.warn('没有找到在线用户');
      return {
        success: false,
        message: '没有找到在线用户'
      };
    } else {
      // 打印每个在线用户的信息
      onlineUsers.data.forEach(user => {
        console.log(`在线用户ID: ${user.id}, openid: ${user.openid}, 头像: ${user.avatar}`);
      });
    }

    // 返回查询到的在线用户数据
    return {
      success: true,
      data: onlineUsers.data  // 返回在线用户的数据
    };
  } catch (err) {
    // 打印捕获到的错误
    console.error('获取在线用户失败:', err);
    return {
      success: false,
      message: '获取在线用户失败',
      error: err.message  // 返回错误信息
    };
  }
};
