Page({
  data: {
    photosURL: [],
    tasks: []  // 存储任务的详细信息
  },

  onLoad: function(options) {
    this.setData({
      photosURL: JSON.parse(options.photosURL),
      tasks: JSON.parse(options.tasks)
    });
  }
});

