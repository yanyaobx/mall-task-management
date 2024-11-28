Page({
  data: {
    id: '', // 用户的ID
    username: '' // 用户名，展示用，不可修改
  },

  onLoad: function() {
    // 获取全局变量
    const app = getApp();

    // 调用云函数获取用户ID
    wx.cloud.callFunction({
      name: 'getUserId', // 调用获取用户ID的云函数
      data: {
        openid: app.globalData.openid // 传递用户的 openid
      },
      success: res => {
        if (res.result.success) {
          this.setData({
            id: res.result.id, // 设置用户ID
            username: app.globalData.username || '用户' // 设置用户名
          });
          app.globalData.userId = res.result.id; // 将ID存储到全局变量
        } else {
          console.error('获取用户ID失败:', res.result.message);
          this.setData({
            id: '默认ID',
            username: app.globalData.username || '用户'
          });
        }
      },
      fail: err => {
        console.error('云函数调用失败:', err);
        this.setData({
          id: '默认ID',
          username: app.globalData.username || '用户'
        });
      }
    });
  },

  onShow: function() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      const app = getApp();
      const rightId = app.globalData.rightId || 0;  // 获取当前用户角色

      // 商户是 3，管理员是 2
      const selectedIndex = rightId === 1 ? 2 : 3;

      // 获取当前的 selected 状态，避免不必要的重复更新
      const currentSelected = this.getTabBar().data.selected;

      // 仅当 selected 状态发生变化时才更新 tabBar
      if (currentSelected !== selectedIndex) {
        this.getTabBar().setData({
          selected: selectedIndex
        });

        // 输出当前选中的 tabBar 图标信息
        const selectedTab = this.getTabBar().data.list[selectedIndex];
        console.log(`页面：当前选中的 Tab 项: ${selectedTab.text}, 图标: ${selectedTab.selectedIconPath}`);
      } else {
        console.log(`页面：Tab 项已经选中，无需更新`);
      }
    } else {
      console.warn('无法获取到自定义 tabBar 实例');
    }
  },
  
  
  // 修改ID的方法
  changeId: function(e) {
    this.setData({
      newId: e.detail.value // 从输入框中获取用户输入的新ID
    });
  },

  confirmChangeId: function() {
    const newId = this.data.newId;
    if (newId) {
      // 调用云函数更新ID
      const app = getApp();
      app.globalData.userId = newId;
      wx.cloud.callFunction({
        name: 'updateUserId',
        data: {
          openid: app.globalData.openid,
          newId: newId
        },
        success: res => {
          if (res.result.success) {
            wx.showToast({
              title: 'ID更新成功',
              icon: 'success'
            });
            this.setData({
              id: newId // 更新页面上的用户ID
            });
          } else {
            wx.showToast({
              title: 'ID更新失败',
              icon: 'none'
            });
          }
        },
        fail: err => {
          console.error('ID更新失败:', err);
          wx.showToast({
            title: 'ID更新失败',
            icon: 'none'
          });
        }
      });
    } else {
      wx.showToast({
        title: '请输入新ID',
        icon: 'none'
      });
    }
  },

  // 退出登录的方法
  logout: function() {
    wx.showModal({
      title: '确认退出',
      content: '你确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          const app = getApp();

          // 调用云函数，将 online 字段设置为 false
          wx.cloud.callFunction({
            name: 'logout', // 调用 logout 云函数
            data: {
              openid: app.globalData.openid // 传递用户的 openid
            },
            success: logoutRes => {
              if (logoutRes.result.success) {
                // 清除全局变量中的用户信息
                app.globalData.openid = null;
                app.globalData.userId = null;
                app.globalData.username = null;

                wx.redirectTo({
                  url: '/pages/login/login'
                });
              } else {
                console.error('登出失败:', logoutRes.result.message);
              }
            },
            fail: err => {
              console.error('调用 logout 云函数失败:', err);
            }
          });
        }
      }
    });
  }
});
