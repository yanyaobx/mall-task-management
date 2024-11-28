const { encryptPassword, decryptPassword } = require('../../utils/crypto'); // 引入加密解密方法

let isNavigating = false; // 标记是否正在导航

Page({
  data: {
    username: '',
    password: '',
    rememberPassword: false // 是否记住密码
  },

  // 处理输入用户名
  onUsernameInput: function(e) {
    this.setData({
      username: e.detail.value
    });
  },

  // 处理输入密码
  onPasswordInput: function(e) {
    this.setData({
      password: e.detail.value
    });
  },

  // 处理“记住密码”选择框状态改变
  onRememberPasswordChange: function(e) {
    this.setData({
      rememberPassword: e.detail.value.length > 0 // 根据选择框的状态更新
    });
  },

  // 页面加载时自动填充账号和密码
  onLoad: function() {
    // 读取本地存储的账号和密码
    const rememberedUsername = wx.getStorageSync('rememberedUsername');
    const rememberedPassword = wx.getStorageSync('rememberedPassword');

    if (rememberedUsername) {
      this.setData({
        username: rememberedUsername,
        rememberPassword: true // 如果存在记住的账号，则设置“记住密码”为选中状态
      });
    }

    if (rememberedPassword) {
      this.setData({
        password: decryptPassword(rememberedPassword) // 解密后填充
      });
    }
  },

  // 点击登录按钮时触发
  onLogin: function() {
    // 检查是否输入用户名和密码
    if (!this.data.username || !this.data.password) {
      wx.showToast({
        title: '请输入用户名和密码',
        icon: 'none'
      });
      return;
    }

    // 打印前端输入的用户名和密码
    console.log('前端传递的用户名:', this.data.username);
    console.log('前端传递的密码:', this.data.password);

    // 获取微信用户的头像和昵称
    wx.getUserProfile({
      desc: '用于完善用户信息',
      success: (profileRes) => {
        // 调用云函数进行登录验证
        wx.cloud.callFunction({
          name: 'login',
          data: {
            username: this.data.username,
            password: this.data.password,
            avatarUrl: profileRes.userInfo.avatarUrl, // 微信头像
            nickName: profileRes.userInfo.nickName    // 微信昵称
          },
          success: res => {
            // 打印云函数返回的结果
            console.log('云函数返回结果:', res);

            if (res.result.success) {
              wx.showToast({
                title: '登录成功',
                icon: 'success',
                duration: 2000
              });

              const app = getApp();
              app.globalData.openid = res.result.openid; 
              wx.setStorageSync('openid', res.result.openid); // 将 openid 存储到本地

              // 存储用户信息
              app.globalData.userId = res.result.userInfo.id;
              app.globalData.username = res.result.userInfo.username;

              const rightId = res.result.rightId;  // 云函数返回的 rightId (0: 普通用户, 1: 管理员)
              app.globalData.rightId = rightId;
              wx.setStorageSync('rightId', rightId);  // 将 rightId 存储到本地

              // 判断是否需要记住密码
              if (this.data.rememberPassword) {
                wx.setStorageSync('rememberedUsername', this.data.username);
                wx.setStorageSync('rememberedPassword', encryptPassword(this.data.password)); // 使用加密后的密码存储
              } else {
                // 如果用户没有选择记住密码，清除本地存储的密码信息
                wx.removeStorageSync('rememberedUsername');
                wx.removeStorageSync('rememberedPassword');
              }

              // 跳转到相应页面
              setTimeout(() => {
                if (rightId === 1) {  // 管理员
                  wx.switchTab({
                    url: '/pages/admin/dashboard/dashboard',
                  });
                } else {  // 普通用户
                  wx.switchTab({
                    url: '/pages/task/task',
                  });
                }
              }, 200); 

            } else {
              wx.showToast({
                title: '账号或密码错误',
                icon: 'none'
              });
              console.error('云函数返回错误信息:', res.result.message);
            }
          },
          fail: err => {
            wx.showToast({
              title: '登录失败，请重试',
              icon: 'none'
            });
            console.error('[云函数] [login] 调用失败:', err);
          }
        });
      },
      fail: (err) => {
        console.error('获取用户信息失败', err);
        wx.showToast({
          title: '获取微信信息失败，请重试',
          icon: 'none'
        });
      }
    });
  },

  // 跳转到注册页面的逻辑
  navigateToRegister: function() {
    if (isNavigating) return; // 防止多次快速点击
    isNavigating = true; // 设置标记为正在导航

    wx.navigateTo({
      url: '/pages/register/register',
      complete: () => {
        isNavigating = false; // 导航完成后重置标记
      }
    });
  }
});
