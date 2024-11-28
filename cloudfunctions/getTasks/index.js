// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }); // 初始化云开发环境，使用当前云环境
const db = cloud.database(); // 连接到数据库

// 云函数入口函数
exports.main = async (event, context) => {
  const { openid } = event; // 从参数中获取 openid
  const currentDate = new Date().toISOString().split('T')[0]; // 获取当天的日期，格式为 YYYY-MM-DD

  try {
    // 获取当天的任务列表，使用 openid 作为查询条件
    let tasks = await db.collection('tasks').where({
      date: currentDate,
      merchantId: openid
    }).get();

    // 如果当天没有五个任务，创建缺少的任务
    if (tasks.data.length < 5) {
      const requiredTasks = [
        { name: '关门' },
        { name: '关电' },
        { name: '关水' },
        { name: '清洁' },
        { name: '闭店' }
      ];

      // 过滤出还未创建的任务，根据 name 匹配任务名称
      const existingTaskNames = tasks.data.map(task => task.name);
      const tasksToAdd = requiredTasks.filter(task => !existingTaskNames.includes(task.name));

      // 使用 Promise.all 并行插入缺少的任务，并获取插入后的 _id
      const addTaskPromises = tasksToAdd.map(task => {
        return db.collection('tasks').add({
          data: {
            ...task,
            date: currentDate, // 当前日期
            status: 'pending', // 默认状态为未完成
            fileID: '', // 初始状态没有文件ID
            merchantId: openid // 在每个新任务记录中添加 merchantId 字段
          }
        });
      });

      // 等待所有任务插入完成，获取新创建的任务 _id 列表
      const addTaskResults = await Promise.all(addTaskPromises);

      // 更新每个新任务，将 taskId 设置为插入时生成的 _id
      const updateTaskPromises = addTaskResults.map(result => {
        return db.collection('tasks').doc(result._id).update({
          data: {
            taskId: result._id // 将 _id 赋值给 taskId 字段
          }
        });
      });

      await Promise.all(updateTaskPromises);

      // 重新查询更新后的任务列表
      tasks = await db.collection('tasks').where({
        date: currentDate,
        merchantId: openid // 确保查询时只获取当前用户的任务记录
      }).get();
    }

    // 返回完整的任务列表
    return {
      success: true,
      data: tasks.data
    };
  } catch (err) {
    // 错误处理，返回错误信息
    console.error('获取任务列表失败：', err);
    return {
      success: false,
      errorMessage: err.message || '获取任务列表失败'
    };
  }
};
