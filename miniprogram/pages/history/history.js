Page({
  data: {
    history: [],        // 存储从数据库获取的历史记录
    completedCount: 0,  // 当前用户已完成任务数量
    totalCount: 0,      // 当前用户总任务数量
    hasHistory: true    // 是否存在历史记录
  },

  // 页面加载时调用
  onLoad: function() {
    this.getHistory();  // 获取历史记录
    this.checkTabBarIcons('onLoad');  // 检查 tabBar 图标状态
  },

  // 页面显示时调用
  onShow: function() {
    console.log('onShow: 页面显示，正在检查 tabBar 状态...');
    const app = getApp();
    const rightId = app.globalData.rightId || 0;  // 获取当前用户角色
    console.log('onShow: 当前用户角色ID:', rightId);

    // 仅当用户是商户时（rightId === 0），才检查和更新 tabBar 状态
    if (rightId === 0) {
      console.log('onShow: 当前用户是商户，检查 tabBar 状态...');
      if (typeof this.getTabBar === 'function' && this.getTabBar()) {
        const selectedIndex = 1;  // 商户页面在 tabBar 中的下标是 1
        if (this.getTabBar().data.selected !== selectedIndex) {
          console.log(`onShow: 更新 tabBar 选中状态为 ${selectedIndex}`);
          this.getTabBar().setData({
            selected: selectedIndex
          });
          const selectedTab = this.getTabBar().data.list[selectedIndex];
          console.log(`onShow: 当前选中的 Tab 项: ${selectedTab.text}, 图标: ${selectedTab.selectedIconPath}`);
        } else {
          console.log('onShow: 商户页面无需更新 tabBar 选中状态');
        }
        this.checkTabBarIcons('onShow');
      } else {
        console.warn('onShow: 无法获取到自定义 tabBar 实例');
      }
    } else {
      console.log('onShow: 当前页面仅商户可见，非商户角色无法访问');
    }
  },

  // 获取历史记录函数
  getHistory: function() {
    const db = wx.cloud.database();          // 连接到云数据库实例
    const openid = getApp().globalData.openid; // 获取当前用户的 openid

    // 从 tasks 集合中查询 _id 为当前用户 openid 的所有任务记录
    db.collection('tasks').where({
      merchantId: openid  // 使用 openid 作为查询条件匹配 openid 字段
    }).get({
      success: res => {
        const tasks = res.data;  // 从数据库中查询到的任务记录
        const completedCount = tasks.filter(task => task.status === 'completed').length; // 统计已完成任务数量
        const totalCount = tasks.length; // 统计总任务数量

        this.setData({
          history: tasks,              // 保存历史任务记录到页面数据中
          completedCount: completedCount,  // 当前用户已完成任务数量
          totalCount: totalCount,          // 当前用户总任务数量
          hasHistory: totalCount > 0       // 如果有任务记录，设置 hasHistory 为 true
        });

        if (totalCount === 0) {
          console.log('历史记录为空: 当前用户还没有完成任何任务');
        } else {
          console.log('历史记录加载成功:', this.data.history);
        }

        this.checkTabBarIcons('getHistory');
      },
      fail: err => {
        console.error('[数据库] [查询记录] 失败：', err);
        this.setData({
          hasHistory: false
        });
        this.checkTabBarIcons('getHistory');
      }
    });
  },

  // 检查当前的 tabBar 图标显示状态
  checkTabBarIcons: function(step) {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      const tabBarList = this.getTabBar().data.list;
      const displayedIcons = tabBarList.map(item => ({
        text: item.text,
        displayedIcon: item.isSelected ? item.selectedIconPath : item.iconPath
      }));
      console.log(`[${step}] 当前显示的 tabBar 图标状态:`, displayedIcons);
      displayedIcons.forEach((icon, idx) => {
        console.log(`[${step}] tabBar 项 ${idx}: ${icon.text}, 显示的图标: ${icon.displayedIcon}`);
      });
      console.log(`[${step}] tabBar 选中状态:`, this.getTabBar().data.list.map(item => item.isSelected));
    } else {
      console.warn(`[${step}] 无法获取到自定义 tabBar 实例`);
    }
  }
});
