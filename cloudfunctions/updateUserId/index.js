const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const { openid, newId } = event;

  try {
    const updateResult = await db.collection('merchants').where({
      openid: openid
    }).update({
      data: {
        id: newId
      }
    });

    if (updateResult.stats.updated > 0) {
      return {
        success: true,
        message: 'ID更新成功'
      };
    } else {
      return {
        success: false,
        message: 'ID更新失败，用户未找到'
      };
    }
  } catch (error) {
    return {
      success: false,
      message: 'ID更新失败',
      error: error
    };
  }
};
