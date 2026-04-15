// pages/games/index.js
const { UNITS } = require('../../utils/data.js');

Page({
  data: {
    units: UNITS,
    stars: 0,
    streak: 0,
    showUnitPicker: false,
    selectedGameType: '',
    gameName: '',
    gameNames: {
      memory: '🃏 Memory Match',
      quiz: '🧠 Quiz Time!',
      spelling: '🐝 Spelling Bee',
      bubble: '🫧 Bubble Pop',
    },
  },

  onShow() {
    this.loadProgress();
  },

  loadProgress() {
    const prog = wx.getStorageSync('ug_prog') || {};
    const stars = prog._stars || 0;
    const checkins = prog._checkins || {};
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
    this.setData({ stars, streak });
  },

  chooseUnit(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      showUnitPicker: true,
      selectedGameType: type,
      gameName: this.data.gameNames[type] || type,
    });
  },

  hideUnitPicker() {
    this.setData({ showUnitPicker: false });
  },

  startGame(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/unit/index?id=${id}&tab=games&gameType=${this.data.selectedGameType}` });
  },
});
