Page({
  data: {
    tasks: []  // 用于存储从数据库获取的用户状态和任务列表
  },

  onLoad: function() {
    this.getAllUserStatus();  // 页面加载时，调用获取用户状态的方法
  },

  onShow: function() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      const selectedIndex = 0;  // 控制面板在 tabBar 中的下标是 0
  
      // 仅在当前选中的 tabBar 项不一致时，才更新选中状态
      if (this.getTabBar().data.selected !== selectedIndex) {
        this.getTabBar().setData({
          selected: selectedIndex
        });
  
        // 输出当前选中的 tabBar 图标信息
        const selectedTab = this.getTabBar().data.list[selectedIndex];
        console.log(`页面：当前选中的 Tab 项: ${selectedTab.text}, 图标: ${selectedTab.selectedIconPath}`);
      } else {
        console.log('无需更新 tabBar 选中状态');
      }
    }
  },  

  // 获取所有用户的任务状态，仅管理员可调用
  getAllUserStatus: function() {
    wx.cloud.callFunction({
      name: 'getAllUserStatus',
      success: res => {
        console.log('用户状态:', res.result.data);  // 打印返回的用户状态数据
        
        // 处理任务数据，预处理 photosURL 数组
        const tasks = res.result.data.map(item => {
          return {
            id: item.id,  // 从云函数返回的数据中获取商户的 id
            progress: item.progress,
            completed: item.completed,  // 是否完成任务
            photosURL: item.tasks ? item.tasks.map(task => task.fileID) : []  // 将 fileID 数组提前准备好，如果 tasks 为空则返回空数组
          };
        });

        this.setData({
          tasks: tasks  // 保存预处理后的任务数据到页面数据
        });
      },
      fail: err => {
        console.error('[云函数] [getAllUserStatus] 调用失败', err);
        wx.showToast({
          title: '获取数据失败',
          icon: 'none'
        });
      }
    });
  },

  // 查看所有照片
  viewAllPhotos: function(event) {
    const photosURL = event.currentTarget.dataset.photosUrl; // 从按钮的数据属性中获取照片URL数组
    const userId = event.currentTarget.dataset.userId; // 获取用户ID

    if (photosURL && photosURL.length > 0) {
      wx.navigateTo({
        url: `/pages/admin/viewPhotos/viewPhotos?photosURL=${encodeURIComponent(JSON.stringify(photosURL))}&userId=${userId}`
      });
    } else {
      wx.showToast({
        title: '该用户暂无照片',
        icon: 'none'
      });
    }
  }
});
