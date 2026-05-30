// pages/unit/index.js
const { UNITS } = require('../../utils/data.js');
const tts = require('../../utils/tts.js');

Page({
  data: {
    unit: null,
    phoneticList: [],
    currentPhoneticIndex: 0,
    currentWords: [],
    tab: 'phonetic',
    isPlaying: false,
  },

  onLoad(query) {
    tts.init();
    const id = query.id;
    const unit = UNITS.find(u => u.id === id);
    
    if (unit) {
      const phoneticList = unit.phonetic_items || [];
      const firstItem = phoneticList[0] || { phonetic: '', words: [] };
      
      this.setData({
        unit,
        phoneticList,
        currentPhoneticIndex: 0,
        currentWords: firstItem.words || [],
        tab: 'phonetic'
      });
    }
  },

  onUnload() {
    tts.stop();
  },

  goBack() {
    wx.navigateBack();
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ tab });
  },

  // 点击音标规则
  selectPhonetic(e) {
    const idx = e.currentTarget.dataset.idx;
    const item = this.data.phoneticList[idx];
    if (item) {
      this.setData({
        currentPhoneticIndex: idx,
        currentWords: item.words || []
      });
    }
  },

  // 播放音标发音
  speakPhonetic(e) {
    const phonetic = e.currentTarget.dataset.phonetic;
    wx.showToast({ title: phonetic, icon: 'none', duration: 800 });
    tts.speakEnglish(phonetic);
  },

  // 播放单词发音
  speakWord(e) {
    const word = e.currentTarget.dataset.word;
    const zh = e.currentTarget.dataset.zh || word;
    wx.showToast({ title: zh, icon: 'none', duration: 800 });
    tts.speakEnglish(word);
  },

  // 播放所有单词
  playAllWords() {
    const words = this.data.currentWords;
    if (!words.length) return;
    
    this.setData({ isPlaying: true });
    this._playWordSequence(words, 0);
  },

  _playWordSequence(words, index) {
    if (index >= words.length) {
      this.setData({ isPlaying: false });
      return;
    }
    
    tts.speakEnglish(words[index]);
    
    setTimeout(() => {
      this._playWordSequence(words, index + 1);
    }, 1500);
  },

  // 进入复习
  goReview() {
    const { unit } = this.data;
    wx.navigateTo({ url: `/pages/review/index?levelId=${unit.id}` });
  },

  // 进入游戏
  goGame(e) {
    const type = e.currentTarget.dataset.type;
    const { unit } = this.data;
    wx.navigateTo({ url: `/pages/games/index?levelId=${unit.id}&type=${type}` });
  }
});
