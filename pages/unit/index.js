// pages/unit/index.js
const { UNITS, MODULES_DATA } = require('../../utils/data.js');

Page({
  data: {
    unit: null,
    tab: 'vocab',
    displayVocab: [],
    isPlaying: false,
    songProgress: 0,
    currentLine: { text: '', zh: '' },
    currentLineIndex: 0,
    songTimer: null,
    // 游戏相关
    gameType: null,
    memoryCards: [],
    moves: 0,
    flipped: [],
    // Quiz
    quizScore: 0,
    quizTotal: 0,
    quizIndex: 0,
    quizOptions: [],
    quizAnswered: false,
    quizSelected: '',
    currentQA: null,
    // Spelling
    spellingWords: [],
    spellingIndex: 0,
    currentWord: null,
    spellingInput: '',
    spellingResult: null,
    spellingDone: false,
    // Bubble
    bubbleCorrect: '',
    bubbleOptions: [],
    bubbleScore: 0,
    bubblePopped: '',
  },

  onLoad(query) {
    const id = query.id;
    const isModule = query.module === 'abc';
    const autoGameType = query.gameType || null;
    
    if (isModule) {
      const mod = MODULES_DATA['abc'];
      this.setData({
        unit: mod,
        displayVocab: mod.items,
        tab: 'vocab',
      });
    } else {
      const unit = UNITS.find(u => u.id === id);
      this.setData({
        unit,
        displayVocab: unit ? unit.vocab : [],
        tab: autoGameType ? 'games' : 'vocab',
        gameType: autoGameType,
      });
      this.initSong(unit);
      // 如果有自动游戏类型，立即开始游戏
      if (autoGameType) {
        setTimeout(() => {
          if (autoGameType === 'memory') this.initMemory();
          if (autoGameType === 'quiz') this.initQuiz();
          if (autoGameType === 'spelling') this.initSpelling();
          if (autoGameType === 'bubble') this.initBubble();
        }, 100);
      }
    }
  },

  onUnload() {
    if (this.data.songTimer) clearInterval(this.data.songTimer);
  },

  goBack() {
    wx.navigateBack();
  },

  switchTab(e) {
    this.setData({ tab: e.currentTarget.dataset.tab });
  },

  // TTS 发音
  speakWord(e) {
    const en = e.currentTarget.dataset.en;
    const zh = e.currentTarget.dataset.zh;
    wx.showToast({ title: zh, icon: 'none', duration: 1000 });
    // 实际使用微信 TTS
    // wx.createInnerAudioContext() 可用于播放音频
  },

  speakQ(e) {
    wx.showToast({ title: e.currentTarget.dataset.en, icon: 'none', duration: 1200 });
  },

  speakA(e) {
    wx.showToast({ title: e.currentTarget.dataset.en, icon: 'none', duration: 1200 });
  },

  // ===== 歌曲播放 =====
  initSong(unit) {
    if (!unit || !unit.song || !unit.song.lines || !unit.song.lines.length) return;
    const firstLine = unit.song.lines[0];
    this.setData({
      currentLine: { text: firstLine.text, zh: firstLine.zh },
      currentLineIndex: 0,
      songProgress: 0,
    });
  },

  toggleSong() {
    const { isPlaying, unit } = this.data;
    if (isPlaying) {
      clearInterval(this.data.songTimer);
      this.setData({ isPlaying: false, songTimer: null });
    } else {
      const timer = setInterval(() => this.nextLine(), 3000);
      this.setData({ isPlaying: true, songTimer: timer });
    }
  },

  nextLine() {
    const { unit, currentLineIndex } = this.data;
    if (!unit || !unit.song || !unit.song.lines) return;
    const lines = unit.song.lines;
    const nextIndex = (currentLineIndex + 1) % lines.length;
    const progress = Math.round(((nextIndex + 1) / lines.length) * 100);
    this.setData({
      currentLineIndex: nextIndex,
      currentLine: { text: lines[nextIndex].text, zh: lines[nextIndex].zh },
      songProgress: progress,
    });
    if (nextIndex === 0) {
      clearInterval(this.data.songTimer);
      this.setData({ isPlaying: false });
    }
  },

  songPrev() {
    const { unit, currentLineIndex } = this.data;
    if (!unit || !unit.song) return;
    const lines = unit.song.lines;
    const prevIndex = (currentLineIndex - 1 + lines.length) % lines.length;
    this.setData({
      currentLineIndex: prevIndex,
      currentLine: { text: lines[prevIndex].text, zh: lines[prevIndex].zh },
      songProgress: Math.round(((prevIndex + 1) / lines.length) * 100),
    });
  },

  songNext() {
    this.nextLine();
  },

  goToLine(e) {
    const { unit } = this.data;
    if (!unit || !unit.song) return;
    const idx = e.currentTarget.dataset.index;
    const lines = unit.song.lines;
    this.setData({
      currentLineIndex: idx,
      currentLine: { text: lines[idx].text, zh: lines[idx].zh },
      songProgress: Math.round(((idx + 1) / lines.length) * 100),
    });
  },

  // ===== 游戏逻辑 =====
  playGame(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ gameType: type });
    if (type === 'memory') this.initMemory();
    if (type === 'quiz') this.initQuiz();
    if (type === 'spelling') this.initSpelling();
    if (type === 'bubble') this.initBubble();
  },

  exitGame() {
    this.setData({ gameType: null });
  },

  // ===== Memory Match =====
  initMemory() {
    const { unit } = this.data;
    const vocab = (unit.vocab || []).slice(0, 6);
    let cards = [];
    vocab.forEach((v, i) => {
      cards.push({ ...v, pair: i, flipped: false, matched: false, idx: i * 2 });
      cards.push({ ...v, pair: i, flipped: false, matched: false, idx: i * 2 + 1 });
    });
    // 打乱
    cards = cards.sort(() => Math.random() - 0.5);
    this.setData({ memoryCards: cards, moves: 0, flipped: [] });
  },

  flipCard(e) {
    const idx = e.currentTarget.dataset.idx;
    const { memoryCards, flipped, moves } = this.data;
    if (flipped.length >= 2) return;
    if (memoryCards[idx].flipped || memoryCards[idx].matched) return;

    memoryCards[idx].flipped = true;
    flipped.push({ card: memoryCards[idx], idx });

    if (flipped.length === 2) {
      const [a, b] = flipped;
      if (a.card.pair === b.card.pair && a.card.pair !== memoryCards[idx].pair) {
        memoryCards[a.idx].matched = true;
        memoryCards[b.idx].matched = true;
        // 检查胜利
        const allMatched = memoryCards.every(c => c.matched);
        if (allMatched) {
          this.recordWin();
          wx.showModal({
            title: '🎉 Memory Match!',
            content: `用了 ${moves} 步完成！太棒了！`,
            showCancel: false,
            success: () => this.initMemory(),
          });
        }
      } else {
        setTimeout(() => {
          memoryCards[a.idx].flipped = false;
          memoryCards[b.idx].flipped = false;
          this.setData({ memoryCards });
        }, 700);
      }
    }

    this.setData({ memoryCards, moves: moves + 1, flipped });
  },

  // ===== Quiz =====
  initQuiz() {
    const { unit } = this.data;
    const qas = (unit.sentences || []).filter(s => s.type === 'qa').slice(0, 5);
    if (!qas.length) return;
    const qa = qas[0];
    const wrong = qas.slice(1, 4).map(q => q.a.en);
    const options = [qa.a.en, ...wrong].sort(() => Math.random() - 0.5);
    this.setData({
      quizScore: 0,
      quizTotal: qas.length,
      quizIndex: 0,
      quizOptions: options,
      quizAnswered: false,
      quizSelected: '',
      currentQA: qa,
      qas,
    });
  },

  selectAnswer(e) {
    const { quizAnswered, quizSelected, currentQA, qas, quizIndex, quizScore } = this.data;
    if (quizAnswered) return;
    const answer = e.currentTarget.dataset.answer;
    const correct = answer === currentQA.a.en;
    this.setData({ quizAnswered: true, quizSelected: answer, quizScore: correct ? quizScore + 1 : quizScore });

    setTimeout(() => {
      const nextIndex = quizIndex + 1;
      if (nextIndex < qas.length) {
        const nextQA = qas[nextIndex];
        const wrong = qas.filter((_, i) => i !== nextIndex).slice(0, 3).map(q => q.a.en);
        const options = [nextQA.a.en, ...wrong].sort(() => Math.random() - 0.5);
        this.setData({
          quizIndex: nextIndex,
          currentQA: nextQA,
          quizOptions: options,
          quizAnswered: false,
          quizSelected: '',
        });
      } else {
        this.recordWin();
        wx.showModal({
          title: '🎉 Quiz 完成!',
          content: `你答对了 ${this.data.quizScore} 题！`,
          showCancel: false,
        });
      }
    }, 1500);
  },

  // ===== Spelling =====
  initSpelling() {
    const { unit } = this.data;
    const words = (unit.games && unit.games.spelling && unit.games.spelling.words) || [];
    if (!words.length) return;
    const vocab = unit.vocab || [];
    const word = words[0];
    const vocabItem = vocab.find(v => v.en === word) || { emoji: '⭐', en: word, zh: word };
    this.setData({
      spellingWords: words,
      spellingIndex: 0,
      currentWord: vocabItem,
      spellingInput: '',
      spellingResult: null,
      spellingDone: false,
    });
  },

  onSpellingInput(e) {
    this.setData({ spellingInput: e.detail.value });
  },

  speakSpelling() {
    wx.showToast({ title: this.data.currentWord.en, icon: 'none' });
  },

  checkSpelling() {
    const { spellingInput, currentWord } = this.data;
    const correct = spellingInput.trim().toLowerCase() === currentWord.en.toLowerCase();
    this.setData({ spellingResult: correct });

    if (correct) {
      this.recordWin();
      const { spellingWords, spellingIndex } = this.data;
      if (spellingIndex < spellingWords.length - 1) {
        setTimeout(() => {
          const nextIndex = spellingIndex + 1;
          const word = spellingWords[nextIndex];
          const vocabItem = this.data.unit.vocab.find(v => v.en === word) || { emoji: '⭐', en: word, zh: word };
          this.setData({
            spellingIndex: nextIndex,
            currentWord: vocabItem,
            spellingInput: '',
            spellingResult: null,
          });
        }, 1200);
      } else {
        wx.showModal({ title: '🎉 Spelling Bee 完成!', content: '太棒了！全部拼对！', showCancel: false });
      }
    }
  },

  // ===== Bubble Pop =====
  initBubble() {
    const { unit } = this.data;
    const bubble = unit.games && unit.games.bubble;
    if (!bubble) return;
    const options = [...bubble.options].sort(() => Math.random() - 0.5);
    this.setData({
      bubbleCorrect: bubble.correct,
      bubbleOptions: options,
      bubbleScore: 0,
      bubblePopped: '',
    });
  },

  popBubble(e) {
    const { bubblePopped, bubbleCorrect, bubbleScore, bubbleOptions } = this.data;
    if (bubblePopped) return;
    const word = e.currentTarget.dataset.word;
    this.setData({ bubblePopped: word });
    if (word === bubbleCorrect) {
      this.recordWin();
      const newScore = bubbleScore + 10;
      const shuffled = [...bubbleOptions].sort(() => Math.random() - 0.5);
      setTimeout(() => {
        this.setData({
          bubbleScore: newScore,
          bubblePopped: '',
          bubbleOptions: shuffled,
        });
      }, 800);
    } else {
      setTimeout(() => {
        this.setData({ bubblePopped: '' });
      }, 1000);
    }
  },

  // ===== 记录游戏胜利 =====
  recordWin() {
    const prog = wx.getStorageSync('ug_prog') || {};
    prog._stars = (prog._stars || 0) + 1;
    const app = getApp();
    app.globalData.stars = prog._stars;
    wx.setStorageSync('ug_prog', prog);
  },
});
