Page({
  data: {
    taskId: '', // 当前任务的ID
    src: '', // 拍摄的照片路径
    isUploading: false // 标记上传状态，防止重复上传
  },

  onLoad: function(options) {
    // 从任务列表页面传递过来的任务ID
    this.setData({
      taskId: options.taskId || ''
    });
  },

  // 使用camera组件拍照
  takePhoto: function() {
    if (this.data.isUploading) {
      wx.showToast({
        title: '正在上传，请稍候',
        icon: 'none'
      });
      return;
    }

    const ctx = wx.createCameraContext(); // 创建相机上下文对象
    ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        this.setData({
          src: res.tempImagePath // 保存拍摄的照片路径
        });
      },
      fail: (err) => {
        console.error('拍照失败', err);
        wx.showToast({
          title: '拍照失败，请重试',
          icon: 'none'
        });
      }
    });
  },

  // 上传照片
  uploadPhoto: function() {
    if (!this.data.src) {
      wx.showToast({
        title: '请先拍照再上传',
        icon: 'none'
      });
      return;
    }

    if (this.data.isUploading) {
      wx.showToast({
        title: '正在上传，请稍候',
        icon: 'none'
      });
      return;
    }

    this.setData({ isUploading: true }); // 设置上传状态，防止重复上传

    const cloudPath = `photos/${new Date().getTime()}-${Math.floor(Math.random() * 1000)}.jpg`;
    wx.cloud.uploadFile({
      cloudPath,
      filePath: this.data.src,
      success: uploadRes => {
        console.log('照片上传成功，fileID:', uploadRes.fileID);
        this.updateTaskPhoto(uploadRes.fileID); // 上传成功后更新任务照片信息
      },
      fail: e => {
        console.error('[上传文件] 失败：', e);
        wx.showToast({
          title: '上传失败，请重试',
          icon: 'none'
        });
        this.setData({ isUploading: false }); // 重置上传状态
      }
    });
  },

  // 更新任务照片信息
  updateTaskPhoto: function(fileID) {
    wx.cloud.callFunction({
      name: 'updateTaskPhoto',
      data: {
        taskId: this.data.taskId,
        photoURL: fileID // 更新任务的照片URL
      },
      success: res => {
        console.log('任务照片更新成功:', res);
        wx.showToast({
          title: '照片已上传',
        });

        // 获取上一个页面实例，并调用 refreshTasks 方法刷新任务列表
        const pages = getCurrentPages(); // 获取当前页面栈
        const prevPage = pages[pages.length - 2]; // 获取上一个页面实例
        if (prevPage && typeof prevPage.refreshTasks === 'function') {
          prevPage.refreshTasks(); // 调用上一个页面的刷新方法
        }

        wx.navigateBack(); // 上传成功后返回任务列表页面
      },
      fail: err => {
        console.error('[云函数] [updateTaskPhoto] 调用失败', err);
        wx.showToast({
          title: '上传失败，请重试',
          icon: 'none'
        });
        this.setData({ isUploading: false }); // 重置上传状态
      }
    });
  },

  // 预览照片
  previewPhoto: function() {
    if (!this.data.src) {
      wx.showToast({
        title: '请先拍照',
        icon: 'none'
      });
      return;
    }

    wx.previewImage({
      urls: [this.data.src] // 预览已拍摄的照片
    });
  },

  // 相机组件错误处理
  onCameraError(e) {
    console.error('相机组件错误', e.detail);
    wx.showToast({
      title: '相机组件出错，请检查权限设置',
      icon: 'none'
    });
  }
});
