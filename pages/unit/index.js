// pages/unit/index.js
const { UNITS, MODULES_DATA } = require('../../utils/units-data.js');
const tts = require('../../utils/tts.js');

// COS 视频基础URL
const SONGS_VIDEOS_BASE = 'https://upgrade-videos-1412449710.cos.ap-guangzhou.myqcloud.com/Songs/';

// ABC 模块数据 - 带防御性检查
const ABC_MODULE = {
  id: 'abc',
  emoji: '🔤',
  name: 'ABC Letters',
  zh: '字母学习',
  color: '#667eea',
  items: (MODULES_DATA && MODULES_DATA.abc && MODULES_DATA.abc.items) ? MODULES_DATA.abc.items.map(item => ({
    emoji: item.emoji || '',
    letter: item.letter || item.en || '',
    en: item.en || item.letter || '',
    zh: item.zh || ''
  })) : []
};

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
    // 对话场景相关
    dialogueIndex: 0,
    dialogueQ: { en: '', zh: '' },
    dialogueA: { en: '', zh: '' },
    dialogueState: 'idle', // idle | q | a
    dialogueSpeaker: null, // emma | tommy | null
    dialoguePlaying: false,
    dialoguePlayTimer: null,
    // 游戏相关
    gameType: null,
    memoryCards: [],
    moves: 0,
    flipped: [],
    memoryMatched: false,
    memoryHint: '',
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
    bubbleQuestions: [],
    bubbleIndex: 0,
    bubbleCorrect: '',
    bubbleOptions: [],
    bubbleScore: 0,
    bubblePopped: '',
    // 歌曲视频
    songVideos: [],
    showVideoPlayer: false,
    currentVideoUrl: '',
    currentVideoTitle: '',
  },

  onLoad(query) {
    // 初始化 TTS 音频上下文
    tts.init();
    
    const id = query.id;
    const isModule = query.module === 'abc';
    const autoGameType = query.tab === 'games' ? query.gameType : null;
    
    console.log('📌 Unit 页面加载，id:', id, 'isModule:', isModule, 'gameType:', autoGameType);
    
    if (isModule) {
      this.setData({
        unit: ABC_MODULE,
        displayVocab: ABC_MODULE.items,
        tab: 'vocab',
      });
    } else {
      const unit = UNITS.find(u => u.id === id);
      console.log('📌 找到单元:', unit ? unit.name : '未找到', 'vocab数量:', unit ? unit.vocab.length : 0);
      
      // 如果有自动游戏类型，直接设置 gameType 并初始化游戏
      const initialGameType = autoGameType;
      
      this.setData({
        unit,
        displayVocab: unit ? unit.vocab : [],
        tab: 'song', // 默认显示歌曲标签
        gameType: initialGameType,
        songVideos: this._getSongVideos(unit),
      });
      
      this.initSong(unit);
      this.initDialogue(unit);
      
      // 初始化游戏
      if (initialGameType) {
        console.log('🎮 自动开始游戏:', initialGameType);
        setTimeout(() => {
          if (initialGameType === 'memory') this.initMemory();
          if (initialGameType === 'quiz') this.initQuiz();
          if (initialGameType === 'spelling') this.initSpelling();
          if (initialGameType === 'bubble') this.initBubble();
        }, 100);
      }
    }
  },

  onUnload() {
    if (this.data.songTimer) clearInterval(this.data.songTimer);
    if (this.data.dialoguePlayTimer) clearTimeout(this.data.dialoguePlayTimer);
    tts.stop();
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
    // 显示中文提示
    wx.showToast({ title: zh, icon: 'none', duration: 800 });
    // 播放英文发音
    tts.speakEnglish(en);
  },

  speakQ(e) {
    const en = e.currentTarget.dataset.en;
    console.log('句型Q点击:', en);
    wx.showToast({ title: en, icon: 'none', duration: 800 });
    tts.speakEnglish(en);
  },

  speakA(e) {
    const en = e.currentTarget.dataset.en;
    console.log('句型A点击:', en);
    wx.showToast({ title: en, icon: 'none', duration: 800 });
    tts.speakEnglish(en);
  },

  // ===== 卡通对话场景 =====
  initDialogue(unit) {
    if (!unit || !unit.sentences || !unit.sentences.length) return;
    const first = unit.sentences[0];
    this.setData({
      dialogueIndex: 0,
      dialogueQ: first.q || { en: '', zh: '' },
      dialogueA: first.a || { en: '', zh: '' },
      dialogueState: 'idle',
      dialogueSpeaker: null,
      dialoguePlaying: false,
    });
  },

  // 选择句型
  selectDialogue(e) {
    const idx = e.currentTarget.dataset.index;
    const { unit } = this.data;
    if (!unit || !unit.sentences) return;
    const s = unit.sentences[idx];
    if (!s) return;

    // 停止当前播放
    this._stopDialogue();

    this.setData({
      dialogueIndex: idx,
      dialogueQ: s.q || { en: '', zh: '' },
      dialogueA: s.a || { en: '', zh: '' },
      dialogueState: 'idle',
      dialogueSpeaker: null,
      dialoguePlaying: false,
    });
  },

  // 播放问题 (Emma 问)
  playDialogueQ() {
    const { dialogueQ, dialoguePlaying } = this.data;
    if (!dialogueQ.en) return;

    // 如果正在顺序播放，先停止
    if (dialoguePlaying) {
      this._stopDialogue();
      return;
    }

    console.log('🎤 Emma 问:', dialogueQ.en);
    this.setData({ dialogueSpeaker: 'emma', dialogueState: 'q' });
    wx.showToast({ title: dialogueQ.zh || dialogueQ.en, icon: 'none', duration: 1000 });
    tts.speakEnglish(dialogueQ.en);
  },

  // 播放回答 (Tommy 答)
  playDialogueA() {
    const { dialogueA, dialoguePlaying } = this.data;
    if (!dialogueA.en) return;

    if (dialoguePlaying) {
      this._stopDialogue();
      return;
    }

    console.log('🎤 Tommy 答:', dialogueA.en);
    this.setData({ dialogueSpeaker: 'tommy', dialogueState: 'a' });
    wx.showToast({ title: dialogueA.zh || dialogueA.en, icon: 'none', duration: 1000 });
    tts.speakEnglish(dialogueA.en);
  },

  // 顺序播放完整对话
  playFullDialogue() {
    const { dialoguePlaying, dialogueState, unit } = this.data;
    if (dialoguePlaying) {
      this._stopDialogue();
      return;
    }

    // 播放问题
    const { dialogueQ } = this.data;
    if (!dialogueQ.en) return;

    this.setData({ dialoguePlaying: true });

    // Emma 问
    this.setData({ dialogueSpeaker: 'emma', dialogueState: 'q' });
    tts.speakEnglish(dialogueQ.en);

    // 2秒后 Tommy 答
    const timer = setTimeout(() => {
      const { dialogueA } = this.data;
      this.setData({ dialogueSpeaker: 'tommy', dialogueState: 'a' });
      tts.speakEnglish(dialogueA.en);
    }, 2200);

    this.setData({ dialoguePlayTimer: timer });
  },

  // 停止播放
  _stopDialogue() {
    const { dialoguePlayTimer } = this.data;
    if (dialoguePlayTimer) {
      clearTimeout(dialoguePlayTimer);
    }
    tts.stop();
    this.setData({
      dialoguePlaying: false,
      dialoguePlayTimer: null,
      dialogueSpeaker: null,
    });
  },

  // 上一句
  dialoguePrev() {
    const { dialogueIndex, unit } = this.data;
    if (!unit || !unit.sentences) return;
    const prevIdx = Math.max(0, dialogueIndex - 1);
    this._stopDialogue();
    const s = unit.sentences[prevIdx];
    this.setData({
      dialogueIndex: prevIdx,
      dialogueQ: s.q || { en: '', zh: '' },
      dialogueA: s.a || { en: '', zh: '' },
      dialogueState: 'idle',
      dialogueSpeaker: null,
    });
  },

  // 下一句
  dialogueNext() {
    const { dialogueIndex, unit } = this.data;
    if (!unit || !unit.sentences) return;
    const nextIdx = Math.min(unit.sentences.length - 1, dialogueIndex + 1);
    this._stopDialogue();
    const s = unit.sentences[nextIdx];
    this.setData({
      dialogueIndex: nextIdx,
      dialogueQ: s.q || { en: '', zh: '' },
      dialogueA: s.a || { en: '', zh: '' },
      dialogueState: 'idle',
      dialogueSpeaker: null,
    });
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

  // 播放歌词发音 - 直接传递给TTS模块处理清理
  playLyric(text) {
    if (text) {
      console.log('🎵 播放歌词:', text);
      tts.speakEnglish(text);
    }
  },

  toggleSong() {
    const { isPlaying, unit } = this.data;
    if (isPlaying) {
      clearInterval(this.data.songTimer);
      this.setData({ isPlaying: false, songTimer: null });
      tts.stop();
    } else {
      // 开始播放时，先播放当前行
      const lines = unit.song.lines;
      if (lines && lines.length > 0) {
        this.playLyric(lines[this.data.currentLineIndex].text);
      }
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
    // 播放新行歌词
    this.playLyric(lines[nextIndex].text);
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
    // 播放上一行歌词
    this.playLyric(lines[prevIndex].text);
  },

  songNext() {
    // 停止当前播放
    tts.stop();
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
    // 播放歌词发音
    this.playLyric(lines[idx].text);
  },

  // 获取当前单元的歌曲视频列表
  _getSongVideos(unit) {
    if (!unit) return [];
    const dataModule = require('../../utils/units-data.js');
    const SONGS_DATA = dataModule.SONGS_DATA;
    const songData = SONGS_DATA.find(s => s.id === unit.id);
    return (songData && songData.videos) || [];
  },

  // 播放歌曲视频
  playSongVideo(e) {
    const idx = e.currentTarget.dataset.idx;
    const video = this.data.songVideos[idx];
    if (!video) return;
    
    const videoUrl = SONGS_VIDEOS_BASE + encodeURIComponent(video.file);
    console.log('🎬 播放歌曲视频:', videoUrl);
    
    this.setData({
      showVideoPlayer: true,
      currentVideoUrl: videoUrl,
      currentVideoTitle: video.title,
    });
  },

  // 关闭视频播放器
  closeVideoPlayer() {
    this.setData({
      showVideoPlayer: false,
      currentVideoUrl: '',
      currentVideoTitle: '',
    });
  },

  // 视频错误处理
  onVideoError(e) {
    console.error('❌ 视频加载失败:', e.detail);
    wx.showToast({ title: '视频加载失败', icon: 'none' });
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

  restartGame() {
    const { gameType } = this.data;
    if (gameType === 'memory') this.initMemory();
    if (gameType === 'quiz') this.initQuiz();
    if (gameType === 'spelling') this.initSpelling();
    if (gameType === 'bubble') this.initBubble();
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
    this.setData({ 
      memoryCards: cards, 
      memoryMoves: 0, 
      flipped: [], 
      memoryMatched: false, 
      memoryHint: '',
      showNextRound: false,
      memoryAllDone: false
    });
  },

  flipCard(e) {
    const idx = e.currentTarget.dataset.idx;
    const { memoryCards, flipped, memoryMoves } = this.data;
    if (flipped.length >= 2) return;
    if (memoryCards[idx].flipped || memoryCards[idx].matched) return;

    memoryCards[idx].flipped = true;
    flipped.push({ card: memoryCards[idx], idx });
    
    // 播放单词发音
    tts.speakEnglish(memoryCards[idx].en);

    if (flipped.length === 2) {
      const [a, b] = flipped;
      // 检查是否匹配（同一对）
      if (a.card.pair === b.card.pair) {
        memoryCards[a.idx].matched = true;
        memoryCards[b.idx].matched = true;
        
        // 播放配对成功语音提示
        setTimeout(() => {
          tts.speakEnglish('Correct');
        }, 300);
        
        // 检查是否全部完成
        const matchedCount = memoryCards.filter(c => c.matched).length;
        const totalPairs = memoryCards.length / 2;
        const allMatched = matchedCount === totalPairs;

        if (allMatched) {
          // 全部完成 - 记录胜利
          this.recordWin();
          this.setData({
            memoryCards,
            flipped: [],
            memoryMatched: true,
            memoryMoves: memoryMoves + 1,
            memoryHint: '🎉 恭喜！用了 ' + (memoryMoves + 1) + ' 步完成！',
            showNextRound: false,
            memoryAllDone: true
          });
          // 播放胜利音效
          setTimeout(() => {
            tts.speakEnglish('Congratulations');
          }, 800);
        } else {
          // 匹配成功，但还没完成 - 显示下一题按钮
          this.setData({
            memoryCards,
            flipped: [],
            memoryMatched: false,
            memoryMoves: memoryMoves + 1,
            memoryHint: '✅ 正确！找到了 ' + matchedCount + '/' + totalPairs + ' 对！',
            showNextRound: true,
            memoryAllDone: false
          });
        }
      } else {
        // 不匹配 - 播放错误提示
        setTimeout(() => {
          tts.speakEnglish('Try again');
        }, 300);
        
        this.setData({ 
          memoryCards,
          memoryMoves: memoryMoves + 1,
          flipped: [],
          memoryHint: '❌ 不对，再试一次！'
        });
        setTimeout(() => {
          memoryCards[a.idx].flipped = false;
          memoryCards[b.idx].flipped = false;
          this.setData({ memoryCards, flipped: [], memoryHint: '' });
        }, 1000);
      }
      return;
    }

    this.setData({ memoryCards, memoryMoves: memoryMoves + 1, flipped });
  },

  // 下一题 - 重新开始新的一轮
  memoryNextRound() {
    const { unit } = this.data;
    const vocab = (unit.vocab || []).slice(0, 6);
    let cards = [];
    vocab.forEach((v, i) => {
      cards.push({ ...v, pair: i, flipped: false, matched: false, idx: i * 2 });
      cards.push({ ...v, pair: i, flipped: false, matched: false, idx: i * 2 + 1 });
    });
    // 打乱顺序
    cards = cards.sort(() => Math.random() - 0.5);
    this.setData({ 
      memoryCards: cards, 
      memoryMoves: 0, 
      flipped: [], 
      memoryMatched: false, 
      memoryHint: '',
      showNextRound: false,
      memoryAllDone: false
    });
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
    // 播放第一题
    setTimeout(() => this.speakQuizQ(), 300);
  },

  // 播放 Quiz 题目
  speakQuizQ() {
    const { currentQA } = this.data;
    if (currentQA) {
      console.log('🎤 播放 Quiz 题目:', currentQA.q.en);
      tts.speakEnglish(currentQA.q.en);
    }
  },

  selectAnswer(e) {
    const { quizAnswered, quizSelected, currentQA, qas, quizIndex, quizScore } = this.data;
    if (quizAnswered) return;
    const answer = e.currentTarget.dataset.answer;
    const correct = answer === currentQA.a.en;
    
    // 播放答案发音
    tts.speakEnglish(answer);
    
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
        // 播放下一题
        setTimeout(() => this.speakQuizQ(), 500);
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
    const word = this.data.currentWord.en;
    wx.showToast({ title: word, icon: 'none', duration: 800 });
    tts.speakEnglish(word);
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
    const vocab = unit.vocab || [];
    if (!vocab.length) return;
    
    // 从词汇表中生成多题泡泡题
    const questions = vocab.slice(0, 6).map(v => {
      // 从其他词汇中随机选3个作为干扰项
      const others = vocab.filter(x => x.en !== v.en);
      const distractors = others.sort(() => Math.random() - 0.5).slice(0, 3);
      const options = [v, ...distractors].sort(() => Math.random() - 0.5);
      return {
        correct: v,
        options: options,
      };
    });
    
    const firstQ = questions[0];
    this.setData({
      bubbleQuestions: questions,
      bubbleIndex: 0,
      bubbleCorrect: firstQ.correct.en,
      bubbleOptions: firstQ.options.map(o => o.en),
      bubbleScore: 0,
      bubblePopped: '',
      bubbleAnswered: false,
    });
  },

  popBubble(e) {
    const { bubblePopped, bubbleCorrect, bubbleScore } = this.data;
    if (bubblePopped) return;
    const word = e.currentTarget.dataset.word;
    
    // 播放单词发音
    tts.speakEnglish(word);
    
    this.setData({ bubblePopped: word, bubbleAnswered: true });
    if (word === bubbleCorrect) {
      // 答对：加分，记录胜利
      this.recordWin();
      this.setData({ bubbleScore: bubbleScore + 10 });
    } else {
      // 答错：播放正确答案发音
      setTimeout(() => {
        tts.speakEnglish(bubbleCorrect);
      }, 500);
    }
  },

  nextBubble() {
    const { bubbleQuestions, bubbleIndex, bubbleScore } = this.data;
    const nextIndex = bubbleIndex + 1;
    
    if (nextIndex < bubbleQuestions.length) {
      // 还有下一题
      const nextQ = bubbleQuestions[nextIndex];
      // 打乱选项顺序（转成字符串数组）
      const shuffledOptions = [...nextQ.options].sort(() => Math.random() - 0.5).map(o => o.en);
      this.setData({
        bubbleIndex: nextIndex,
        bubbleCorrect: nextQ.correct.en,
        bubbleOptions: shuffledOptions,
        bubblePopped: '',
        bubbleAnswered: false,
      });
    } else {
      // 所有题目完成
      this.recordWin();
      wx.showModal({
        title: '🎉 Bubble Pop 完成!',
        content: `你得到了 ${bubbleScore} 分！太棒了！`,
        showCancel: false,
        success: () => this.initBubble(),
      });
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
