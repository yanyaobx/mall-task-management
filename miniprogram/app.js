const eventBus = require('./utils/eventBus');

App({
  eventBus: eventBus, // 将事件总线绑定到 App 实例
  globalData: {
    openid: null,
    appid: null,
    unionid: null,
    userId: null,
    username: null,
    rightId: 0, // 默认用户角色为 0 (普通用户)
    list1: [  // 商户的 tabBar 列表
      {
        "pagePath": "/pages/task/task",
        "iconPath": "/images/icons/task.png",
        "selectedIconPath": "/images/icons/task-active.png",
        "text": "任务"
      },
      {
        "pagePath": "/pages/history/history",
        "iconPath": "/images/icons/history.png",
        "selectedIconPath": "/images/icons/history-active.png",
        "text": "历史"
      },
      {
        "pagePath": "/pages/voip/voip",
        "iconPath": "/images/icons/voip.png",
        "selectedIconPath": "/images/icons/voip-active.png",
        "text": "通话"
      },
      {
        "pagePath": "/pages/user-center/index",
        "iconPath": "/images/icons/usercenter.png",
        "selectedIconPath": "/images/icons/usercenter-active.png",
        "text": "我"
      }
    ],
    list2: [  // 管理员的 tabBar 列表
      {
        "pagePath": "/pages/admin/dashboard/dashboard",
        "iconPath": "/images/icons/dashboard.png",
        "selectedIconPath": "/images/icons/dashboard-active.png",
        "text": "控制面板"
      },
      {
        "pagePath": "/pages/voip/voip",
        "iconPath": "/images/icons/voip.png",
        "selectedIconPath": "/images/icons/voip-active.png",
        "text": "通话"
      },
      {
        "pagePath": "/pages/user-center/index",
        "iconPath": "/images/icons/usercenter.png",
        "selectedIconPath": "/images/icons/usercenter-active.png",
        "text": "我"
      }
    ]
  },

  onLaunch: function () {
    try {
      if (!wx.cloud) {
        console.error('请使用 2.2.3 或以上的基础库以使用云能力');
      } else {
        wx.cloud.init({
          env: 'test456-6gg8q94o850b11a3', // 使用你的云环境 ID
          traceUser: true, // 是否跟踪用户
        });
      }

      // 检查本地存储的 token 和用户角色信息
      const storedToken = wx.getStorageSync('userToken'); // 获取存储的 token
      const storedRightId = wx.getStorageSync('rightId'); // 获取存储的用户角色

      if (storedToken) {
        // 如果存在 token，则验证 token 的有效性
        wx.cloud.callFunction({
          name: 'checkToken', // 假设你有一个检查 token 的云函数
          data: { token: storedToken },
          success: res => {
            if (res.result.success) {
              // 如果 token 有效，更新全局用户信息和角色
              this.globalData.openid = res.result.openid;
              this.globalData.userId = res.result.userId;
              this.globalData.username = res.result.username;
              this.globalData.rightId = storedRightId; // 使用本地存储的角色信息
              console.log('用户已自动登录:', res.result.username);

              // 触发角色更新事件，通知 tabBar 更新
              this.eventBus.emit('rightChange', storedRightId);
            } else {
              // 如果 token 无效，跳转到登录页面
              console.log('token 无效或过期，请重新登录');
              this.redirectToLogin();
            }
          },
          fail: err => {
            console.error('token 验证失败:', err);
            this.redirectToLogin(); // 验证失败也跳转到登录页面
          }
        });
      } else {
        // 如果没有 token，跳转到登录页面
        console.log('未找到 token，请登录');
        this.redirectToLogin();
      }
    } catch (error) {
      console.error('onLaunch 错误:', error);
      this.redirectToLogin();
    }
  },

  // 跳转到登录页面的函数
  redirectToLogin() {
    wx.redirectTo({
      url: '/pages/login/login' // 跳转到登录页面
    });
  },

  changeUserRight() {
    try {
      const currentRole = wx.getStorageSync('rightId') || 0; 
      const newRole = currentRole === 0 ? 1 : 0; // 0 为普通用户，1 为管理员
      wx.setStorageSync('rightId', newRole);
      this.globalData.rightId = newRole;
      this.eventBus.emit('rightChange', newRole);
      console.log('用户角色已切换，当前角色:', newRole);
    } catch (error) {
      console.error('切换角色时出错:', error);
    }
  }
});
