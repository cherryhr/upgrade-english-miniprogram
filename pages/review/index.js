// pages/review/index.js - 综合复习游戏
const { UNITS } = require('../../utils/units-data.js');
const tts = require('../../utils/tts.js');

Page({
  data: {
    // 游戏状态
    gameStarted: false,
    gameOver: false,
    
    // 题目相关
    questions: [],       // 所有题目
    currentIndex: 0,      // 当前题目索引
    currentQuestion: null, // 当前题目
    totalQuestions: 20,   // 总题数
    
    // 答题相关
    options: [],          // 选项
    selectedAnswer: '',
    answered: false,
    isCorrect: false,
    
    // 得分相关
    score: 0,
    correctCount: 0,
    wrongCount: 0,
    
    // 进度
    progressPercent: 0,
    
    // 最终评价
    finalComment: '',
    finalGrade: '',
    finalEmoji: '',
  },

  onLoad() {
    // 初始化 TTS
    tts.init();
    
    // 生成游戏
    this.generateQuestions();
  },

  onUnload() {
    tts.stop();
  },

  // 生成题目：从所有单元提取词汇和句型
  generateQuestions() {
    const questions = [];
    
    // 1. 从每个单元提取词汇题目
    UNITS.forEach(unit => {
      if (unit.vocab && unit.vocab.length > 0) {
        // 随机选1-2个词汇
        const vocabCount = Math.min(2, unit.vocab.length);
        const shuffledVocab = [...unit.vocab].sort(() => Math.random() - 0.5);
        shuffledVocab.slice(0, vocabCount).forEach(vocab => {
          questions.push({
            type: 'vocab',
            unitId: unit.id,
            unitName: unit.name,
            unitEmoji: unit.emoji,
            question: vocab.zh,  // 显示中文
            answer: vocab.en,    // 正确答案
            emoji: vocab.emoji,
            audioText: vocab.en, // 用于TTS播放
          });
        });
      }
    });
    
    // 2. 从每个单元提取句型题目
    UNITS.forEach(unit => {
      if (unit.sentences && unit.sentences.length > 0) {
        // 随机选1-2个句型
        const sentenceCount = Math.min(2, unit.sentences.length);
        const shuffledSentences = [...unit.sentences].sort(() => Math.random() - 0.5);
        shuffledSentences.slice(0, sentenceCount).forEach(sentence => {
          // 句型题：显示问题，答案是回答
          if (sentence.type === 'qa') {
            questions.push({
              type: 'sentence',
              unitId: unit.id,
              unitName: unit.name,
              unitEmoji: unit.emoji,
              question: sentence.q.en,  // 显示英文问题
              questionZh: sentence.q.zh,
              answer: sentence.a.en,    // 正确答案
              answerZh: sentence.a.zh,
              emoji: sentence.q.icon,
              audioText: sentence.q.en,
            });
          }
        });
      }
    });
    
    // 打乱顺序
    questions.sort(() => Math.random() - 0.5);
    
    // 取前20题（如果不足20题，取全部）
    const selectedQuestions = questions.slice(0, this.data.totalQuestions);
    
    console.log('📝 生成复习题目:', selectedQuestions.length, '题');
    
    this.setData({ questions: selectedQuestions });
  },

  // 开始游戏
  startGame() {
    if (this.data.questions.length === 0) {
      wx.showToast({ title: '暂无题目', icon: 'none' });
      return;
    }
    
    // 生成第一题的选项
    this.generateOptions(0);
    
    this.setData({
      gameStarted: true,
      gameOver: false,
      currentIndex: 0,
      currentQuestion: this.data.questions[0],
      score: 0,
      correctCount: 0,
      wrongCount: 0,
      progressPercent: 0,
    });
    
    // 播放第一题
    setTimeout(() => this.playCurrentQuestion(), 500);
  },

  // 生成当前题的选项
  generateOptions(index) {
    const question = this.data.questions[index];
    if (!question) return;
    
    let correctAnswer = question.answer;
    let wrongOptions = [];
    
    // 从其他题目中随机选3个作为干扰项
    const otherQuestions = this.data.questions.filter((q, i) => i !== index);
    const shuffledOthers = otherQuestions.sort(() => Math.random() - 0.5);
    wrongOptions = shuffledOthers.slice(0, 3).map(q => q.answer);
    
    // 如果干扰项不足3个，从词汇表中补充
    if (wrongOptions.length < 3) {
      const allVocab = UNITS.flatMap(u => u.vocab || []).map(v => v.en);
      const filteredVocab = allVocab.filter(v => v !== correctAnswer && !wrongOptions.includes(v));
      const shuffledVocab = filteredVocab.sort(() => Math.random() - 0.5);
      wrongOptions = [...wrongOptions, ...shuffledVocab.slice(0, 3 - wrongOptions.length)];
    }
    
    // 合并并打乱选项
    const options = [correctAnswer, ...wrongOptions].sort(() => Math.random() - 0.5);
    
    this.setData({
      options: options,
      selectedAnswer: '',
      answered: false,
      isCorrect: false,
    });
  },

  // 播放当前题目
  playCurrentQuestion() {
    const question = this.data.currentQuestion;
    if (question && question.audioText) {
      console.log('🔊 播放题目:', question.audioText);
      tts.speakEnglish(question.audioText);
    }
  },

  // 重复播放题目
  replayQuestion() {
    this.playCurrentQuestion();
  },

  // 选择答案
  selectAnswer(e) {
    if (this.data.answered) return;
    
    const answer = e.currentTarget.dataset.answer;
    const question = this.data.currentQuestion;
    const isCorrect = answer === question.answer;
    
    // 播放选择的答案
    tts.speakEnglish(answer);
    
    this.setData({
      selectedAnswer: answer,
      answered: true,
      isCorrect: isCorrect,
      correctCount: isCorrect ? this.data.correctCount + 1 : this.data.correctCount,
      wrongCount: isCorrect ? this.data.wrongCount : this.data.wrongCount + 1,
      score: isCorrect ? this.data.score + 10 : this.data.score,
    });

    // 如果答错，延迟后播放正确答案
    if (!isCorrect) {
      setTimeout(() => {
        wx.showToast({ title: '正确答案: ' + question.answer, icon: 'none', duration: 1500 });
        setTimeout(() => tts.speakEnglish(question.answer), 500);
      }, 800);
    }

    // 2秒后进入下一题
    setTimeout(() => this.nextQuestion(), 2000);
  },

  // 下一题
  nextQuestion() {
    const nextIndex = this.data.currentIndex + 1;
    
    if (nextIndex >= this.data.questions.length) {
      // 游戏结束
      this.endGame();
    } else {
      // 下一题
      const nextQuestion = this.data.questions[nextIndex];
      this.generateOptions(nextIndex);
      
      this.setData({
        currentIndex: nextIndex,
        currentQuestion: nextQuestion,
        progressPercent: Math.round(((nextIndex + 1) / this.data.questions.length) * 100),
      });
      
      // 播放下一题
      setTimeout(() => this.playCurrentQuestion(), 300);
    }
  },

  // 游戏结束
  endGame() {
    const { correctCount, totalQuestions } = this.data;
    const percent = Math.round((correctCount / totalQuestions) * 100);
    
    // 根据正确率确定评价
    let finalComment, finalGrade, finalEmoji;
    
    if (percent >= 80) {
      finalComment = 'Great!';
      finalGrade = '优秀';
      finalEmoji = '🌟';
    } else if (percent >= 60) {
      finalComment = 'Well done!';
      finalGrade = '良好';
      finalEmoji = '👍';
    } else {
      finalComment = 'To be improved';
      finalGrade = '继续加油';
      finalEmoji = '💪';
    }
    
    this.setData({
      gameOver: true,
      finalComment,
      finalGrade,
      finalEmoji,
      progressPercent: 100,
    });
    
    // 播放结束语
    setTimeout(() => {
      tts.speakEnglish(finalComment);
    }, 500);
    
    // 记录成绩
    this.saveProgress();
  },

  // 保存进度
  saveProgress() {
    const prog = wx.getStorageSync('ug_prog') || {};
    const today = new Date().toISOString().split('T')[0];
    
    // 记录复习游戏完成
    if (!prog._reviews) prog._reviews = {};
    prog._reviews[today] = {
      score: this.data.score,
      correct: this.data.correctCount,
      total: this.data.totalQuestions,
      percent: Math.round((this.data.correctCount / this.data.totalQuestions) * 100),
    };
    
    // 增加星星
    prog._stars = (prog._stars || 0) + 1;
    
    wx.setStorageSync('ug_prog', prog);
  },

  // 重新开始
  restartGame() {
    // 重新生成题目
    this.generateQuestions();
    
    this.setData({
      gameStarted: false,
      gameOver: false,
      currentIndex: 0,
      currentQuestion: null,
      options: [],
      selectedAnswer: '',
      answered: false,
      isCorrect: false,
      score: 0,
      correctCount: 0,
      wrongCount: 0,
      progressPercent: 0,
    });
  },

  // 返回
  goBack() {
    wx.navigateBack();
  },
});
