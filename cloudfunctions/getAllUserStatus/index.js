// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event, context) => {
  const currentDate = new Date().toISOString().split('T')[0]; // 获取当天的日期

  // 获取所有商户信息
  const merchantsResult = await db.collection('merchants').get();
  const merchants = merchantsResult.data;

  // 获取当天所有任务
  const tasksResult = await db.collection('tasks').where({
    date: currentDate
  }).get();
  const tasks = tasksResult.data;

  const taskSummary = {};

  // 汇总任务信息
  tasks.forEach(task => {
    const { merchantId, status, taskId } = task;

    if (!taskSummary[merchantId]) {
      taskSummary[merchantId] = {
        id: '',  // 初始化为空，稍后填充
        completedTasks: 0,
        tasks: []
      };
    }

    taskSummary[merchantId].tasks.push(task);

    if (status === 'completed') {
      taskSummary[merchantId].completedTasks += 1;
    }
  });

  // 处理每个商户，检查是否有任务生成，如果没有，设置为“未打开应用”
  const result = merchants.map(merchant => {
    const merchantTasks = taskSummary[merchant._id] || {
      id: merchant.id, // 从 merchants 集合获取 id
      completedTasks: 0,
      tasks: [],
      statusMessage: "该用户今天还未打开过本应用" // 默认状态
    };

    // 如果任务已存在，更新用户名和进度信息
    if (taskSummary[merchant._id]) {
      merchantTasks.id = merchant.id;
      merchantTasks.progress = `${merchantTasks.completedTasks}/5`;
      merchantTasks.completed = merchantTasks.completedTasks === 5;
    } else {
      // 未生成任务的用户
      merchantTasks.progress = "0/5";
      merchantTasks.completed = false;
    }

    return merchantTasks;
  });

  // 排序：未完成的任务在上，已完成的任务在下
  result.sort((a, b) => a.completed - b.completed);

  return {
    data: result
  };
};
