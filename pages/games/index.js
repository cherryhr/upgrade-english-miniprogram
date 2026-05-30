// pages/games/index.js - 简化版游戏页面
const { UNITS } = require('../../utils/data.js');
const tts = require('../../utils/tts.js');

Page({
  data: {
    levelId: '',
    level: null,
    gameType: '',
    gameTitle: '',
    
    // 游戏状态
    isGameStarted: false,
    isGameFinished: false,
    
    // Memory游戏
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    moves: 0,
    
    // Quiz游戏
    quizQuestions: [],
    currentQuizIndex: 0,
    quizScore: 0,
    quizTotal: 0,
    showQuizResult: false,
    selectedAnswer: '',
    isQuizAnswered: false
  },

  onLoad(query) {
    tts.init();
    const levelId = query.levelId || 'u1';
    const gameType = query.type || 'memory';
    const level = UNITS.find(u => u.id === levelId);
    
    if (level) {
      const gameTitles = {
        memory: '🃏 Memory Match',
        quiz: '🧠 Quiz Time',
        spelling: '🐝 Spelling Bee',
        bubble: '🫧 Bubble Pop'
      };
      
      this.setData({
        levelId,
        level,
        gameType,
        gameTitle: gameTitles[gameType] || gameType
      });
      
      this.initGame(gameType, level);
    }
  },

  onUnload() {
    tts.stop();
  },

  goBack() {
    wx.navigateBack();
  },

  initGame(type, level) {
    if (type === 'memory') {
      this.initMemoryGame(level);
    } else if (type === 'quiz') {
      this.initQuizGame(level);
    } else if (type === 'spelling') {
      this.initSpellingGame(level);
    } else if (type === 'bubble') {
      this.initBubbleGame(level);
    }
  },

  // ===== Memory Match 游戏 =====
  initMemoryGame(level) {
    // 提取音标和单词对
    const pairs = [];
    level.phonetic_items.forEach(item => {
      if (item.words && item.words.length >= 1) {
        pairs.push({
          id: pairs.length,
          phonetic: item.phonetic,
          word: item.words[0]
        });
      }
    });
    
    // 最多8对
    const selectedPairs = pairs.slice(0, 8);
    
    // 创建卡片
    let cards = [];
    selectedPairs.forEach((pair, idx) => {
      cards.push({
        id: idx * 2,
        type: 'phonetic',
        text: pair.phonetic,
        pairId: idx,
        flipped: false,
        matched: false
      });
      cards.push({
        id: idx * 2 + 1,
        type: 'word',
        text: pair.word,
        pairId: idx,
        flipped: false,
        matched: false
      });
    });
    
    // 打乱
    cards = this.shuffleArray(cards);
    
    this.setData({
      cards,
      flippedCards: [],
      matchedPairs: 0,
      moves: 0,
      isGameStarted: true,
      isGameFinished: false
    });
  },

  shuffleArray(arr) {
    const array = [...arr];
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  },

  onCardTap(e) {
    const idx = e.currentTarget.dataset.idx;
    const cards = this.data.cards;
    const flippedCards = this.data.flippedCards;
    
    // 已翻2张或已匹配，忽略
    if (flippedCards.length >= 2) return;
    if (cards[idx].flipped || cards[idx].matched) return;
    
    // 翻牌
    const key = `cards[${idx}].flipped`;
    this.setData({
      [key]: true,
      flippedCards: [...flippedCards, idx]
    });
    
    // 播放
    tts.speakEnglish(cards[idx].text);
    
    // 检查匹配
    if (this.data.flippedCards.length === 2) {
      this.checkMatch();
    }
  },

  checkMatch() {
    const cards = this.data.cards;
    const flipped = this.data.flippedCards;
    const idx1 = flipped[0];
    const idx2 = flipped[1];
    
    // 使用局部变量避免异步问题
    const newMatchedPairs = this.data.matchedPairs + 1;
    const newMoves = this.data.moves + 1;
    const totalPairs = cards.length / 2;
    
    setTimeout(() => {
      if (cards[idx1].pairId === cards[idx2].pairId) {
        // 匹配成功
        this.setData({
          [`cards[${idx1}].matched`]: true,
          [`cards[${idx2}].matched`]: true,
          matchedPairs: newMatchedPairs,
          flippedCards: [],
          moves: newMoves
        });
        
        tts.speakEnglish('Correct');
        
        // 检查是否完成（使用局部变量）
        if (newMatchedPairs >= totalPairs) {
          this.setData({ isGameFinished: true });
        }
      } else {
        // 匹配失败
        this.setData({
          [`cards[${idx1}].flipped`]: false,
          [`cards[${idx2}].flipped`]: false,
          flippedCards: [],
          moves: newMoves
        });
      }
    }, 1000);
  },

  restartMemory() {
    this.initMemoryGame(this.data.level);
  },

  // ===== Quiz游戏 =====
  initQuizGame(level) {
    const questions = [];
    
    level.phonetic_items.forEach(item => {
      if (item.words && item.words.length > 0) {
        // 音标→选单词
        const wrongWords = [];
        while (wrongWords.length < 3) {
          const randItem = level.phonetic_items[Math.floor(Math.random() * level.phonetic_items.length)];
          const randWord = randItem.words[Math.floor(Math.random() * randItem.words.length)];
          if (randWord !== item.words[0] && !wrongWords.includes(randWord)) {
            wrongWords.push(randWord);
          }
        }
        
        questions.push({
          question: item.phonetic,
          answer: item.words[0],
          options: this.shuffleArray([item.words[0], ...wrongWords])
        });
      }
    });
    
    const quizQuestions = this.shuffleArray(questions).slice(0, 10);
    
    this.setData({
      quizQuestions,
      currentQuizIndex: 0,
      quizScore: 0,
      quizTotal: quizQuestions.length,
      showQuizResult: false,
      isGameStarted: true,
      isGameFinished: false
    });
    
    this.showQuizQuestion();
  },

  showQuizQuestion() {
    const { quizQuestions, currentQuizIndex } = this.data;
    if (currentQuizIndex >= quizQuestions.length) {
      this.setData({ showQuizResult: true, isGameFinished: true });
      return;
    }
    
    tts.speakEnglish(quizQuestions[currentQuizIndex].question);
  },

  selectQuizAnswer(e) {
    const answer = e.currentTarget.dataset.answer;
    const question = this.data.quizQuestions[this.data.currentQuizIndex];
    const isCorrect = answer === question.answer;
    
    this.setData({
      selectedAnswer: answer,
      isQuizAnswered: true,
      quizScore: isCorrect ? this.data.quizScore + 1 : this.data.quizScore
    });
    
    setTimeout(() => {
      tts.speakEnglish(isCorrect ? 'Correct' : question.answer);
    }, 300);
  },

  nextQuizQuestion() {
    if (this.data.currentQuizIndex + 1 >= this.data.quizTotal) {
      this.setData({ showQuizResult: true, isGameFinished: true });
      return;
    }
    
    this.setData({
      currentQuizIndex: this.data.currentQuizIndex + 1,
      selectedAnswer: '',
      isQuizAnswered: false
    });
    
    this.showQuizQuestion();
  },

  restartQuiz() {
    this.initQuizGame(this.data.level);
  },

  // ===== Spelling游戏 =====
  initSpellingGame(level) {
    const allWords = [];
    level.phonetic_items.forEach(item => {
      if (item.words) {
        item.words.forEach(word => {
          allWords.push(word);
        });
      }
    });
    
    const words = this.shuffleArray(allWords).slice(0, 10);
    
    this.setData({
      spellingWords: words,
      currentSpellingIndex: 0,
      currentSpellingWord: words[0],
      userInput: '',
      spellingScore: 0,
      showSpellingResult: false,
      isGameStarted: true,
      isGameFinished: false
    });
    
    setTimeout(() => {
      tts.speakEnglish(words[0]);
    }, 500);
  },

  onSpellingInput(e) {
    this.setData({ userInput: e.detail.value });
  },

  submitSpelling() {
    const isCorrect = this.data.userInput.toLowerCase().trim() === 
                     this.data.currentSpellingWord.toLowerCase();
    
    this.setData({
      isSpellingCorrect: isCorrect,
      showSpellingResult: true,
      spellingScore: isCorrect ? this.data.spellingScore + 1 : this.data.spellingScore
    });
  },

  nextSpellingWord() {
    const nextIdx = this.data.currentSpellingIndex + 1;
    
    if (nextIdx >= this.data.spellingWords.length) {
      this.setData({ isGameFinished: true });
      return;
    }
    
    this.setData({
      currentSpellingIndex: nextIdx,
      currentSpellingWord: this.data.spellingWords[nextIdx],
      userInput: '',
      showSpellingResult: false
    });
    
    setTimeout(() => {
      tts.speakEnglish(this.data.spellingWords[nextIdx]);
    }, 500);
  },

  restartSpelling() {
    this.initSpellingGame(this.data.level);
  },

  // ===== Bubble游戏 =====
  initBubbleGame(level) {
    this.setData({
      bubbleScore: 0,
      bubbleTime: 60,
      isGameStarted: true,
      isGameFinished: false
    });
    
    // 简化版：只显示得分界面
    wx.showToast({
      title: 'Bubble游戏开发中',
      icon: 'none'
    });
  },

  restartBubble() {
    this.initBubbleGame(this.data.level);
  }
});
