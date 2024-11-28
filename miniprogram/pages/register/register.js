Page({
  data: {
    username: '',
    password: '',
  },
  onUsernameInput: function(e) {
    this.setData({ username: e.detail.value });
  },
  onPasswordInput: function(e) {
    this.setData({ password: e.detail.value });
  },
  onRegister: function() {
    if (!this.data.username || !this.data.password) {
      wx.showToast({ title: '请输入用户名和密码', icon: 'none' });
      return;
    }
    wx.cloud.callFunction({
      name: 'registerUser',
      data: {
        username: this.data.username,
        password: this.data.password,
      },
      success: res => {
        if (res.result.success) {
          wx.showToast({ title: '注册成功', icon: 'success' });
          this.completeRegistration(); // 调用 completeRegistration 方法
        } else {
          wx.showToast({ title: res.result.message, icon: 'none' });
        }
      },
      fail: err => {
        console.error('注册失败:', err);
        wx.showToast({ title: '注册失败，请重试', icon: 'none' });
      },
    });
  },
  completeRegistration: function() {
    // 跳转回登录页面
    wx.redirectTo({
      url: '/pages/login/login' // 使用 redirectTo 返回登录页面
    });
  }
});
