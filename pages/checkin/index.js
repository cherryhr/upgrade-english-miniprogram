// pages/checkin/index.js
Page({
  data: {
    checkedToday: false,
    totalDays: 0,
    streak: 0,
    stars: 0,
    currentMonth: '',
    weekdays: ['日', '一', '二', '三', '四', '五', '六'],
    calendarDays: [],
    recentRecords: [],
  },

  onShow() {
    this.loadCheckins();
  },

  loadCheckins() {
    const prog = wx.getStorageSync('ug_prog') || {};
    const checkins = prog._checkins || {};
    const stars = prog._stars || 0;

    const today = new Date().toISOString().split('T')[0];
    const checkedToday = !!checkins[today];

    // 计算连续天数
    let streak = 0;
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

    // 生成日历
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const monthName = `${year}年${month + 1}月`;
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayStr = today;

    const calendarDays = [];
    for (let i = 0; i < firstDay; i++) calendarDays.push({ day: '', checked: false, future: false });
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      calendarDays.push({
        day: d,
        checked: !!checkins[dateStr],
        future: dateStr > todayStr,
      });
    }

    // 最近记录
    const recentRecords = dates.slice(0, 10).map(date => ({
      date: date.replace(/-/g, '/'),
    }));

    this.setData({
      checkedToday,
      totalDays: dates.length,
      streak,
      stars,
      currentMonth: monthName,
      calendarDays,
      recentRecords,
    });
  },

  doCheckin() {
    if (this.data.checkedToday) return;

    const today = new Date().toISOString().split('T')[0];
    const prog = wx.getStorageSync('ug_prog') || {};
    prog._checkins = prog._checkins || {};
    prog._checkins[today] = true;
    prog._stars = (prog._stars || 0) + 1;
    wx.setStorageSync('ug_prog', prog);

    wx.showModal({
      title: '🎉 打卡成功！',
      content: '太棒了！获得 1 颗星星！⭐',
      showCancel: false,
    });

    this.loadCheckins();
  },
});
