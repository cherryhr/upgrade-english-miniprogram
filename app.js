// UpGrade English - 微信小程序主入口
// 基于 Oxford Phonics World 风格，专为4-8岁儿童设计

App({
  globalData: {
    userInfo: null,
    stars: 0,
    streak: 0,
  },

  onLaunch() {
    // 从 localStorage 读取进度
    const prog = wx.getStorageSync('ug_prog') || {};
    this.globalData.stars = prog._stars || 0;
    this.globalData.streak = this.calcStreak(prog);
    
    console.log('🚀 App 启动');
    // 初始化 TTS 音频上下文
    const tts = require('./utils/tts.js');
    tts.init();
  },

  onShow() {
    // 每次显示页面时初始化 TTS
    const tts = require('./utils/tts.js');
    tts.init();
  },

  calcStreak(prog) {
    if (!prog || !prog._checkins) return 0;
    const dates = Object.keys(prog._checkins).sort().reverse();
    if (!dates.length) return 0;
    const today = new Date().toISOString().split('T')[0];
    if (dates[0] !== today) return 0;
    let streak = 1;
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1]);
      const curr = new Date(dates[i]);
      const diff = (prev - curr) / 86400000;
      if (diff === 1) { streak++; } else { break; }
    }
    return streak;
  }
});
