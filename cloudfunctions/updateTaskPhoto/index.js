// 云函数入口文件
const cloud = require('wx-server-sdk');

// 初始化云函数
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV // 使用当前云环境
});

const db = cloud.database(); // 初始化数据库
const _ = db.command; // 获取数据库操作符

// 云函数入口函数
exports.main = async (event, context) => {
  const { taskId, photoURL } = event;
  const wxContext = cloud.getWXContext(); // 获取微信上下文信息（如 openid）

  // 日志输出接收到的参数
  console.log('【云函数】接收到的参数:', { taskId, photoURL });

  // 检查输入参数是否完整
  if (!taskId || !photoURL) {
    console.warn('【云函数】参数不完整:', { taskId, photoURL });
    return {
      success: false,
      message: '参数不完整，请提供 taskId 和 photoURL'
    };
  }

  // 检查 photoURL 是否指向 photos 文件夹
  if (!photoURL.startsWith('cloud://') || !photoURL.includes('/photos/')) {
    console.warn('【云函数】照片路径错误, 应该指向 photos 文件夹:', photoURL);
    return {
      success: false,
      message: '照片路径错误，请检查 photoURL'
    };
  }

  try {
    // 获取指定任务信息，检查任务是否存在
    console.log('【云函数】正在获取任务信息, taskId:', taskId);
    const taskRecord = await db.collection('tasks').doc(taskId).get();

    if (!taskRecord.data) {
      console.warn('【云函数】任务未找到, taskId:', taskId);
      return {
        success: false,
        message: '任务未找到，请检查 taskId 是否正确'
      };
    }

    console.log('【云函数】任务信息:', taskRecord.data);

    // 定义更新数据对象
    const updateData = {
      photosURL: [photoURL], // 替换为新的照片URL，覆盖原有的
      lastUpdatedBy: wxContext.OPENID, // 记录最后更新者
      lastUpdatedTime: db.serverDate(), // 更新为服务器时间
      status: 'completed' // 更新任务状态为已完成
    };

    // 更新任务照片信息，替换原有的照片URL，并更新任务状态为已完成
    console.log('【云函数】开始更新任务照片信息, photoURL:', photoURL);
    const updateResult = await db.collection('tasks').doc(taskId).update({
      data: updateData
    });

    // 判断是否更新成功
    console.log('【云函数】更新结果:', updateResult);
    if (updateResult.stats.updated === 1) {
      console.log('【云函数】任务照片更新成功并状态已更改为已完成');
      return {
        success: true,
        message: '任务照片更新成功并状态已更改为已完成',
        data: updateResult
      };
    } else {
      console.warn('【云函数】任务照片更新失败，请重试');
      return {
        success: false,
        message: '任务照片更新失败，请重试'
      };
    }

  } catch (error) {
    console.error('【云函数】[updateTaskPhoto] 调用失败', error);
    return {
      success: false,
      message: '云函数内部错误，请联系开发者',
      error: error
    };
  }
};
