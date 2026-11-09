const wordbookService = require('../../services/wordbook');
const progressService = require('../../services/progress');
const storage = require('../../utils/storage');
const dateUtils = require('../../utils/date');
const {
  STORAGE_KEYS,
  DEFAULT_PROFILE,
  DEFAULT_SETTINGS,
} = require('../../utils/constants');

Page({
  data: {
    loading: true,
    currentBook: {
      id: 'cet4',
      level: 'CET-4',
      name: '大学英语四级',
      subtitle: '高频核心词汇',
    },
    learnedCount: 0,
    todayStudied: 0,
    totalWords: 0,
    dailyGoal: 20,
    percent: 0,
    streak: 0,
    startLabel: '开始今日学习',
    avatarText: '词',
    dailyWord: null,
    dailyBookName: '',
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
      const profile = {
        ...DEFAULT_PROFILE,
        ...storage.get(STORAGE_KEYS.PROFILE, {}),
      };
      const settings = {
        ...DEFAULT_SETTINGS,
        ...storage.get(STORAGE_KEYS.SETTINGS, {}),
      };
      const learnedCount = (progress.learnedWordIds || []).length;
      const todayStudied = progressService.getTodayStudiedCount(progress);
      const dailyGoal = Math.max(1, Number(settings.dailyGoal || 20));
      const now = new Date();
      const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      const dailyWord = wordbookService.getDailyWord(now);
      const dailyBook = dailyWord
        ? wordbookService.getWordbookById(dailyWord.bookId)
        : null;

      this.setData({
        loading: false,
        currentBook,
        learnedCount,
        todayStudied,
        totalWords: currentBook.totalWords || 0,
        dailyGoal,
        percent: Math.min(100, Math.round((todayStudied / dailyGoal) * 100)),
        streak: dateUtils.calculateStreak(progress.studyDates || []),
        startLabel: todayStudied > 0 ? '继续今日学习' : '开始今日学习',
        avatarText: profile.nickname.slice(0, 1) || '词',
        dailyWord,
        dailyBookName: dailyBook ? dailyBook.name : '',
        todayLabel: `${now.getMonth() + 1}月${now.getDate()}日 · ${weekdays[now.getDay()]}`,
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

  openSearch() {
    wx.navigateTo({ url: '/pages/search/search' });
  },

  openLibrary() {
    wx.navigateTo({ url: '/pages/library/library' });
  },

  openDailyWord() {
    if (!this.data.dailyWord) {
      return;
    }
    wx.navigateTo({
      url: `/pages/word-detail/word-detail?bookId=${this.data.dailyWord.bookId}&wordId=${this.data.dailyWord.id}`,
    });
  },
});

