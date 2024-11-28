// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { taskId, photosURL } = event; // 接收包含多个fileID的数组

  if (!taskId || !photosURL || photosURL.length === 0) {
    return {
      success: false,
      message: 'Task ID or photosURL cannot be empty'
    };
  }

  try {
    const updateResult = await db.collection('tasks').doc(taskId).update({
      data: {
        status: 'completed',
        photosURL: photosURL // 将 fileID 数组存储在 photosURL 字段中
      }
    });

    if (updateResult.stats.updated === 0) {
      return {
        success: false,
        message: 'No task was updated, task ID may be incorrect'
      };
    }

    return {
      success: true,
      message: 'Task completed and photos uploaded'
    }
  } catch (error) {
    console.error('Task completion failed:', error)
    return {
      success: false,
      message: 'Task completion failed',
      error: error
    }
  }
}
