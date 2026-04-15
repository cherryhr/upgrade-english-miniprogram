// pages/home/index.js
const { UNITS } = require('../../utils/data.js');

Page({
  data: {
    units: UNITS,
    stars: 0,
    streak: 0,
    progress: {},
  },

  onLoad() {
    this.loadProgress();
  },

  onShow() {
    this.loadProgress();
  },

  loadProgress() {
    const prog = wx.getStorageSync('ug_prog') || {};
    const stars = prog._stars || 0;
    const checkins = prog._checkins || {};
    
    // 计算连续打卡天数
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const dates = Object.keys(checkins).sort().reverse();
    if (dates.length > 0 && dates[0] === today) {
      streak = 1;
      for (let i = 1; i < dates.length; i++) {
        const prev = new Date(dates[i - 1]);
        const curr = new Date(dates[i]);
        const diff = (prev - curr) / 86400000;
        if (diff === 1) streak++;
        else break;
      }
    }

    // 计算每个单元的完成度
    const progress = {};
    UNITS.forEach(u => {
      const unitProg = prog[u.id] || {};
      const total = (u.vocab ? u.vocab.length : 0) + (u.sentences ? u.sentences.length : 0);
      const done = (unitProg.vocab || []).length + (unitProg.sentences || []).length;
      progress[u.id] = total > 0 ? Math.round((done / total) * 100) : 0;
    });

    this.setData({ stars, streak, progress });
  },

  goUnit(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/unit/index?id=${id}` });
  },

  goModule(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/unit/index?id=${id}&module=abc` });
  }
});
