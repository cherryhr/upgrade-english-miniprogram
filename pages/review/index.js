// pages/review/index.js
const { UNITS } = require('../../utils/units-data.js');
const tts = require('../../utils/tts.js');

Page({
  data: {
    levelId: null,
    unit: null,
    reviewList: [],
    currentIndex: 0,
    currentItem: null,
    score: 0,
    totalQuestions: 0,
    isAnswered: false,
    selectedAnswer: '',
    isFinished: false
  },

  onLoad(query) {
    tts.init();
    const levelId = query.levelId || 'u1';
    const unit = UNITS.find(u => u.id === levelId);
    
    if (unit) {
      // 生成复习题目：混合音标和单词
      const reviewList = [];
      
      // 添加音标题
      unit.phonetic_items.forEach((item, idx) => {
        reviewList.push({
          type: 'phonetic',
          question: item.phonetic,
          answer: item.phonetic,
          words: item.words,
          hint: '点击播放音标发音'
        });
        
        // 添加单词题（每个音标规则选2个单词）
        const wordsToReview = item.words.slice(0, 2);
        wordsToReview.forEach(word => {
          reviewList.push({
            type: 'word',
            question: word,
            answer: word,
            phonetic: item.phonetic,
            hint: '点击播放单词发音'
          });
        });
      });
      
      // 打乱顺序
      const shuffled = reviewList.sort(() => Math.random() - 0.5);
      
      this.setData({
        levelId,
        unit,
        reviewList: shuffled,
        totalQuestions: shuffled.length,
        currentItem: shuffled[0] || null
      });
    }
  },

  onUnload() {
    tts.stop();
  },

  goBack() {
    wx.navigateBack();
  },

  // 播放当前题目
  playQuestion() {
    const { currentItem } = this.data;
    if (!currentItem) return;
    
    if (currentItem.type === 'phonetic') {
      tts.speakEnglish(currentItem.question);
    } else {
      tts.speakEnglish(currentItem.question);
    }
  },

  // 选择题模式 - 显示选项
  showChoices() {
    const { currentItem, reviewList } = this.data;
    if (!currentItem) return;
    
    // 生成干扰项
    const allWords = [];
    reviewList.forEach(item => {
      if (item.type === 'word') {
        allWords.push(item.answer);
      }
    });
    
    const wrongAnswers = allWords
      .filter(w => w !== currentItem.answer)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const choices = [currentItem.answer, ...wrongAnswers].sort(() => Math.random() - 0.5);
    
    this.setData({
      choices,
      showChoices: true
    });
  },

  // 选择答案
  selectAnswer(e) {
    const answer = e.currentTarget.dataset.answer;
    const { currentItem, score } = this.data;
    
    const isCorrect = answer === currentItem.answer;
    
    this.setData({
      isAnswered: true,
      selectedAnswer: answer,
      score: isCorrect ? score + 1 : score
    });
    
    // 播放反馈
    setTimeout(() => {
      if (isCorrect) {
        tts.speakEnglish('Correct');
      } else {
        tts.speakEnglish(currentItem.answer);
      }
    }, 300);
  },

  // 下一题
  nextQuestion() {
    const { currentIndex, reviewList } = this.data;
    const nextIndex = currentIndex + 1;
    
    if (nextIndex >= reviewList.length) {
      // 完成
      this.setData({
        isFinished: true
      });
      return;
    }
    
    this.setData({
      currentIndex: nextIndex,
      currentItem: reviewList[nextIndex],
      isAnswered: false,
      selectedAnswer: '',
      showChoices: false
    });
  },

  // 重新复习
  restartReview() {
    const { reviewList } = this.data;
    const shuffled = reviewList.sort(() => Math.random() - 0.5);
    
    this.setData({
      currentIndex: 0,
      currentItem: shuffled[0],
      score: 0,
      isAnswered: false,
      selectedAnswer: '',
      isFinished: false,
      showChoices: false,
      reviewList: shuffled
    });
  }
});
