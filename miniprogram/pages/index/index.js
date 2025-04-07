const wordbookService = require('../../services/wordbook');
const progressService = require('../../services/progress');

Page({
  data: {
    loading: true,
    currentBook: null,
    learnedCount: 0,
    dailyGoal: 20,
    percent: 0,
    streak: 0,
    todayLabel: '',
  },

  async onShow() {
    await this.loadDashboard();
  },

  async loadDashboard() {
    this.setData({ loading: true });
    try {
      const currentWordbookId = wordbookService.getCachedWordbookId();
      const books = await wordbookService.getWordbooks();
      const currentBook = books.find((book) => book.id === currentWordbookId) || books[0];
      const progress = progressService.loadProgress(currentBook.id);
      const learnedCount = (progress.learnedWordIds || []).length;
      const dailyGoal = Math.max(1, currentBook.totalWords || 20);
      const now = new Date();

      this.setData({
        loading: false,
        currentBook,
        learnedCount,
        dailyGoal,
        percent: Math.min(100, Math.round((learnedCount / dailyGoal) * 100)),
        streak: (progress.studyDates || []).length,
        todayLabel: `${now.getMonth() + 1}月${now.getDate()}日`,
      });
    } catch (error) {
      console.error('加载首页失败', error);
      this.setData({ loading: false });
      wx.showToast({ title: '加载失败，请重试', icon: 'none' });
    }
  },

  startStudy() {
    wx.navigateTo({ url: '/pages/study/study' });
  },

  startQuiz() {
    wx.navigateTo({ url: '/pages/quiz/quiz' });
  },

  openMistakes() {
    wx.navigateTo({ url: '/pages/mistakes/mistakes' });
  },

  openStats() {
    wx.navigateTo({ url: '/pages/stats/stats' });
  },

  openProfile() {
    wx.navigateTo({ url: '/pages/profile/profile' });
  },
});

