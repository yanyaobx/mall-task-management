const app = getApp();

Component({
  options: {
    styleIsolation: 'apply-shared'
  },
  data: {
    rightId: wx.getStorageSync('rightId') || 0,  // 获取用户角色，默认为0
    selected: 0,  // 当前选中的 tabBar 项
    list: [] // 存储当前的 tabBar 列表
  },

  attached() {
    // 防止重复调用 attached
    if (this.attachedExecuted) return;
    this.attachedExecuted = true;

    const initialRoleId = wx.getStorageSync('rightId') || 0;
    console.log('attached: 从缓存中读取的角色ID:', initialRoleId);

    this.setData({
      rightId: initialRoleId,
      selected: 0  // 初始化 selected 为 0
    });

    this.changeTabBar();  // 根据角色加载不同的 tabBar 列表

    // 监听角色变化事件
    app.eventBus.on('rightChange', (newRole) => {
      console.log('rightChange: 捕获角色变更，新的角色ID:', newRole);
      this.setData({
        rightId: newRole
      });
      this.changeTabBar();  // 角色变化时重新设置 tabBar
    });
  },

  methods: {
    // 根据 rightId 加载不同用户的 tabBar 列表
    changeTabBar() {
      const list = this.data.rightId === 1 ? app.globalData.list2 : app.globalData.list1;  // 管理员使用 list2，商户使用 list1

      // 如果没有 isSelected 属性，则添加并初始化为 false
      const updatedList = list.map(item => ({
        ...item,
        isSelected: item.isSelected || false // 初始化为 false
      }));

      console.log('changeTabBar: 加载的 tabBar 列表为:', updatedList);

      this.setData({
        list: updatedList
      }, () => {
        console.log('changeTabBar: tabBar 列表已更新:', this.data.list);
        this.updateTabBarIcons(); // 更新图标状态
      });
    },

    // 点击 tabBar 触发的事件
    switchTab(e) {
      const data = e.currentTarget.dataset;
      const index = data.index;
      const path = data.path;

      console.log(`switchTab: 点击了 tab ${index}, path: ${path}`);

      // 仅当选中的 tab 发生变化时，才更新状态
      if (this.data.selected !== index) {
        console.log(`switchTab: 正在切换 tab，从 ${this.data.selected} 到 ${index}`);
        // 更新选中的 tabBar 项
        this.updateTabBarSelection(index);

        // 页面跳转，确保选中状态已经更新后再跳转页面
        wx.switchTab({
          url: path,
          success: () => {
            console.log('页面跳转成功');
            this.updateTabBarIcons();  // 确保只在成功后更新图标状态
          },
          fail: (error) => {
            console.error('页面跳转失败', error);
          }
        });
      } else {
        console.log('点击了当前已选中的 tab，跳转取消');
      }
    },

    // 更新选中状态，并切换图标
    updateTabBarSelection(index) {
      console.log(`updateTabBarSelection: 更新选中状态为 ${index}`);
      this.setData({
        selected: index
      }, () => {
        console.log('updateTabBarSelection: 当前选中的图标:', this.data.list[index].selectedIconPath);
        this.updateTabBarIcons();  // 每次更新选中状态后调用图标切换函数
      });
    },

    // 仅切换图标，不改变文字颜色
    updateTabBarIcons() {
      const selectedIndex = this.data.selected;  // 获取当前选中的索引
      console.log('updateTabBarIcons: 当前选中的索引:', selectedIndex);

      // 打印 setData 调用前的 list 状态
      console.log('updateTabBarIcons: 更新前的 list 状态:', this.data.list);

      // 先将所有 tab 的选中状态重置为未选中，并恢复初始图标
      const updatedList = this.data.list.map((item, index) => ({
        ...item,
        iconPath: index === selectedIndex ? item.selectedIconPath : item.iconPath, // 根据是否选中设置图标路径
        isSelected: index === selectedIndex // 仅当前选中的 tab 为 true
      }));

      // 更新 tabBar 的数据
      this.setData({
        list: updatedList
      }, () => {
        // 打印 setData 调用后的 list 状态
        console.log('updateTabBarIcons: 图标更新完成后的 list 状态:', this.data.list);

        // 检查视图与数据是否同步
        this.data.list.forEach((item, index) => {
          console.log(`检查图标状态：tab ${index}, isSelected: ${item.isSelected}, 显示图标: ${item.iconPath}`);
        });
      });
    }
  }
});
