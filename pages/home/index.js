// pages/home/index.js
const { UNITS } = require('../../utils/data.js');

Page({
  data: {
    stars: 0,
    streak: 0,
    units: UNITS
  },

  onLoad() {
    const stars = wx.getStorageSync('stars') || 0;
    const streak = wx.getStorageSync('streak') || 0;
    this.setData({ stars, streak });
  },

  onShow() {
    const stars = wx.getStorageSync('stars') || 0;
    const streak = wx.getStorageSync('streak') || 0;
    this.setData({ stars, streak });
  },

  goUnit(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/unit/index?id=${id}` });
  },

  goSongs() {
    wx.switchTab({ url: '/pages/songs/index' });
  },

  goReview() {
    wx.navigateTo({ url: '/pages/review/index' });
  }
});
