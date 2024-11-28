Page({
  data: {
    isInCall: false,
    callStatus: '未通话',
    onlineUsers: [], // 在线用户列表
    selectedTabBarIndex: 0,
    isAdmin: false, // 默认用户角色为普通用户
  },

  onLoad: function () {
    console.log('页面加载中...');
    this.checkUserRole(); // 检查用户角色并更新 tabBar

    // 激活 VoIP 通话功能
    wx.setEnable1v1Chat({
      enable: true,
      success: res => {
        console.log("VoIP通话功能已激活", res);
      },
      fail: err => {
        console.error("激活VoIP通话功能失败", err);
      }
    });

    // 监听 VoIP 相关事件
    wx.onVoIPChatMembersChanged(members => {
      console.log("当前通话成员发生变化", members);
      this.setData({
        callStatus: `当前通话人数: ${members.length}`
      });
    });

    wx.onVoIPChatInterrupted(() => {
      console.warn("通话已中断");
      this.setData({
        isInCall: false,
        callStatus: '通话已中断'
      });
    });
  },

  // 权限检查并引导授权函数
  checkPermissions: function () {
    wx.getSetting({
      success: res => {
        // 如果没有摄像头和麦克风的授权
        if (!res.authSetting['scope.camera'] || !res.authSetting['scope.record']) {
          // 请求摄像头权限
          wx.authorize({
            scope: 'scope.camera',
            success: () => {
              console.log('摄像头权限已授权');
              // 授权成功后再请求麦克风权限
              wx.authorize({
                scope: 'scope.record',
                success: () => {
                  console.log('麦克风权限已授权');
                },
                fail: () => {
                  console.warn('麦克风权限被拒绝');
                  this.promptUserToSettings(); // 引导用户去设置开启权限
                }
              });
            },
            fail: () => {
              console.warn('摄像头权限被拒绝');
              this.promptUserToSettings(); // 引导用户去设置开启权限
            }
          });
        } else {
          console.log('摄像头和麦克风权限已授权');
        }
      },
      fail: err => {
        console.error('获取权限设置失败:', err);
      }
    });
  },

  // 引导用户手动开启权限
  promptUserToSettings: function () {
    wx.showModal({
      title: '权限提示',
      content: '需要摄像头和麦克风权限才能进行视频通话，请点击确定前往设置中开启权限。',
      showCancel: true,
      success: modalRes => {
        if (modalRes.confirm) {
          wx.openSetting({
            success: settingRes => {
              // 用户从设置中返回后再次检查权限是否开启
              if (settingRes.authSetting['scope.camera'] && settingRes.authSetting['scope.record']) {
                console.log('权限已在设置中开启');
                wx.showToast({
                  title: '权限已授权，请再次点击发起通话',
                  icon: 'none'
                });
              } else {
                wx.showToast({
                  title: '权限未完全授权，无法使用视频通话功能',
                  icon: 'none'
                });
              }
            },
            fail: () => {
              wx.showToast({
                title: '设置打开失败，请手动前往微信设置中授权',
                icon: 'none'
              });
            }
          });
        } else if (modalRes.cancel) {
          wx.showToast({
            title: '权限未授权，无法使用视频通话功能',
            icon: 'none'
          });
        }
      }
    });
  },

  // 页面显示时的逻辑
  onShow: function () {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      const app = getApp();
      const rightId = app.globalData.rightId || 0;

      const selectedIndex = rightId === 1 ? 1 : 2;
      const currentSelected = this.getTabBar().data.selected;

      if (currentSelected !== selectedIndex) {
        this.getTabBar().setData({
          selected: selectedIndex
        });

        const selectedTab = this.getTabBar().data.list[selectedIndex];
        console.log(`页面：当前选中的 Tab 项: ${selectedTab.text}, 图标: ${selectedTab.selectedIconPath}`);
      } else {
        console.log(`页面：Tab 项已经选中，无需更新`);
      }
    } else {
      console.warn('无法获取到自定义 tabBar 实例');
    }
  },

  // 搜索在线用户
  searchOnlineUsers: function () {
    console.log('开始搜索在线用户...');
    wx.cloud.callFunction({
      name: 'getOnlineUsers',
      success: res => {
        console.log('云函数 getOnlineUsers 调用成功', res);
        if (res.result.success) {
          if (res.result.data.length > 0) {
            this.setData({
              onlineUsers: res.result.data
            });
            console.log('在线用户列表已更新', this.data.onlineUsers);
          } else {
            this.setData({
              onlineUsers: [],
              callStatus: '目前无人在线'
            });
            console.warn('目前无人在线');
            wx.showToast({
              title: '目前无人在线',
              icon: 'none'
            });
          }
        } else {
          wx.showToast({
            title: '未能找到在线用户',
            icon: 'none'
          });
          console.warn('未能找到在线用户:', res);
          this.setData({
            onlineUsers: [],
            callStatus: '未能找到在线用户'
          });
        }
      },
      fail: err => {
        wx.showToast({
          title: '搜索在线用户失败',
          icon: 'none'
        });
        console.error('云函数调用失败:', err);
        this.setData({
          onlineUsers: [],
          callStatus: '搜索在线用户失败'
        });
      }
    });
  },

  // 点击刷新按钮时，调用获取在线用户的方法
  refreshOnlineUsers: function () {
    console.log('刷新按钮被点击');
    this.searchOnlineUsers();
  },

  // 发起通话
  initiateCall: function (event) {
    console.log('发起通话按钮被点击，准备发起通话...');
    
    // 检查权限
    wx.getSetting({
      success: res => {
        // 判断是否已经授权摄像头和麦克风权限
        if (!res.authSetting['scope.camera'] || !res.authSetting['scope.record']) {
          // 请求摄像头权限
          wx.authorize({
            scope: 'scope.camera',
            success: () => {
              console.log('摄像头权限已授权');
              // 授权成功后再请求麦克风权限
              wx.authorize({
                scope: 'scope.record',
                success: () => {
                  console.log('麦克风权限已授权');
                  // 授权成功后，发起通话
                  this.startCall(event);
                },
                fail: () => {
                  console.warn('麦克风权限被拒绝');
                  this.promptUserToSettings(); // 引导用户去设置开启权限
                }
              });
            },
            fail: () => {
              console.warn('摄像头权限被拒绝');
              this.promptUserToSettings(); // 引导用户去设置开启权限
            }
          });
        } else {
          this.startCall(event); // 如果权限已授权，直接发起通话
        }
      },
      fail: err => {
        console.error('获取权限设置失败:', err);
      }
    });
  },

  // 实际开始通话的函数
  startCall: function (event) {
    const listenerOpenid = event.currentTarget.dataset.openid;
    const app = getApp();
    console.log('正在发起通话，监听用户 openid:', listenerOpenid);

    wx.join1v1Chat({
      caller: {
        nickname: app.globalData.username,
        avatar: app.globalData.avatarUrl
      },
      listener: {
        openid: listenerOpenid
      },
      success: res => {
        console.log('通话发起成功:', res);
        this.setData({
          isInCall: true,
          callStatus: '通话中'
        });
      },
      fail: err => {
        console.error("通话发起失败:", err);
      }
    });
  },

  // 结束通话
  endCall: function () {
    console.log('挂断通话按钮被点击');
    wx.exitVoIPChat({
      success: res => {
        console.log('通话已挂断:', res);
        this.setData({
          isInCall: false,
          callStatus: '通话已挂断'
        });
      },
      fail: err => {
        console.error("挂断通话失败:", err);
      }
    });
  },

  // 使用 rightId 检查用户角色并更新
  checkUserRole: function () {
    console.log('正在检查用户角色...');
    const app = getApp();
    const rightId = app.globalData.rightId || 0;

    this.setData({
      isAdmin: rightId === 1,
      selectedTabBarIndex: rightId === 1 ? 1 : 2
    });

    console.log('用户角色已确定，当前用户为:', rightId === 1 ? '管理员' : '普通用户');
  },

  // 图片加载完成事件，用于调试图片资源加载
  onIconLoad: function (e) {
    console.log('图标加载完成:', e);
  }
});
