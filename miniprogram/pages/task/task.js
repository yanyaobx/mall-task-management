Page({
  data: {
    date: '', // 当前日期
    tasks: [], // 任务列表
    isAllTasksCompleted: false, // 所有任务是否完成的状态
    currentTaskId: null // 当前要上传照片的任务ID
  },

  onLoad: function() {
    this.getTodayDate(); // 获取当前日期
    this.getTasks(); // 获取任务列表
  },

  onShow: function() {
    const app = getApp();
    const rightId = app.globalData.rightId || 0; // 获取用户角色
    if (rightId !== 0) {
      console.warn('当前用户不是商户，无需设置 tabBar');
      return;
    }

    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      const selectedIndex = 0;
      this.getTabBar().setData({
        selected: selectedIndex // 设置选中的 tabBar 项目
      });
    }
  },

  // 获取当前日期
  getTodayDate: function() {
    const today = new Date();
    const date = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    this.setData({
      date: date
    });
  },

  // 获取任务列表
  getTasks: function() {
    wx.cloud.callFunction({
      name: 'getTasks',
      data: {
        merchantId: getApp().globalData.openid // 传递当前用户的 openid
      },
      success: res => {
        const tasks = res.result.data.map(task => {
          // 将 _id 赋值给 taskId
          task.taskId = task._id;
          return task;
        });
        const isAllTasksCompleted = tasks.length === 5 && tasks.every(task => task.status === 'completed');
        this.setData({
          tasks: tasks,
          isAllTasksCompleted: isAllTasksCompleted // 更新所有任务的完成状态
        });
      },
      fail: err => {
        console.error('[云函数] [getTasks] 调用失败', err);
      }
    });
  },

  // 检查并请求摄像头权限
  checkCameraPermission: function(callback) {
    wx.getSetting({
      success: res => {
        if (!res.authSetting['scope.camera']) {
          // 如果未授权，进行权限请求
          wx.authorize({
            scope: 'scope.camera',
            success: () => {
              console.log('已授权摄像头权限');
              if (callback) callback(); // 授权成功后执行回调
            },
            fail: () => {
              // 如果用户拒绝授权，提示用户并引导到设置页
              wx.showModal({
                title: '摄像头权限请求',
                content: '该功能需要使用摄像头权限，请前往设置页授权。',
                confirmText: '去设置',
                success: (modalRes) => {
                  if (modalRes.confirm) {
                    wx.openSetting({
                      success: (settingRes) => {
                        if (settingRes.authSetting['scope.camera']) {
                          console.log('已授权摄像头权限');
                          if (callback) callback(); // 授权成功后执行回调
                        } else {
                          wx.showToast({
                            title: '未授权摄像头权限，无法使用该功能',
                            icon: 'none'
                          });
                        }
                      },
                      fail: err => {
                        console.error('打开设置页失败', err);
                        wx.showToast({
                          title: '打开设置页失败，请稍后重试',
                          icon: 'none'
                        });
                      }
                    });
                  } else {
                    wx.showToast({
                      title: '未授权摄像头权限，无法使用该功能',
                      icon: 'none'
                    });
                  }
                }
              });
            }
          });
        } else {
          if (callback) callback(); // 如果已经授权，直接执行回调
        }
      },
      fail: err => {
        console.error('获取权限设置失败', err);
        wx.showToast({
          title: '获取权限设置失败，请稍后重试',
          icon: 'none'
        });
      }
    });
  },

  // 跳转到拍照页面并传递任务ID（此时任务ID已经是 _id）
  navigateToPhotoCapture: function(event) {
    const taskId = event.currentTarget.dataset.taskId;
    this.checkCameraPermission(() => {
      wx.navigateTo({
        url: `/pages/photoCapture/photoCapture?taskId=${taskId}` // 任务ID等同于 _id
      });
    });
  },

  // 预览任务照片
  viewTaskPhotos: function(event) {
    const taskId = event.currentTarget.dataset.taskId;
    const task = this.data.tasks.find(task => task.taskId === taskId);

    if (task && task.photosURL && task.photosURL.length > 0) {
      wx.previewImage({
        urls: task.photosURL // 更新为多个照片路径数组
      });
    } else {
      wx.showToast({
        title: '暂无照片可查看',
        icon: 'none'
      });
    }
  },

  // 更新任务列表状态
  refreshTasks: function() {
    this.getTasks(); // 重新获取任务列表，刷新页面显示
  }
});
