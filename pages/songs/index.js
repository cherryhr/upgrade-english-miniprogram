// pages/songs/index.js
const dataModule = require('../../utils/units-data.js');
const SONGS_DATA = dataModule.SONGS_DATA || (dataModule.UNITS || []).map(u => ({
  id: u.id,
  emoji: u.emoji,
  name: u.name,
  zh: u.zh,
  color: u.color,
  song: u.song,
  videos: u.videos || []
}));

// 腾讯云 COS 视频基础URL
const VIDEO_BASE = 'https://upgrade-videos-1412449710.cos.ap-guangzhou.myqcloud.com/Songs/';

Page({
  data: {
    songs: SONGS_DATA,
    totalVideos: 0,
    playing: false,
    currentVideo: null,
    currentUnit: null
  },

  onLoad() {
    const songs = this.data.songs || [];
    const total = songs.reduce ? songs.reduce((n, s) => n + ((s.videos && s.videos.length) || 0), 0) : 0;
    const unitsWithVideos = songs.filter(s => s.videos && s.videos.length > 0).length;
    this.setData({ totalVideos: total, unitsWithVideos });
  },

  playVideo(e) {
    const unitIdx = e.currentTarget.dataset.unitIdx;
    const videoIdx = e.currentTarget.dataset.videoIdx;
    const song = this.data.songs[unitIdx];
    const video = song.videos[videoIdx];
    
    // 构建完整的视频URL
    const videoUrl = VIDEO_BASE + encodeURIComponent(video.file);
    
    this.setData({
      playing: true,
      currentVideo: { ...video, url: videoUrl },
      currentUnit: song
    });
  },

  closePlayer() {
    this.setData({
      playing: false,
      currentVideo: null,
      currentUnit: null
    });
  },

  videoError(e) {
    console.error('视频加载失败:', e.detail);
    wx.showToast({
      title: '视频加载失败',
      icon: 'none'
    });
  },

  onUnload() {
    this.setData({ playing: false });
  }
});
