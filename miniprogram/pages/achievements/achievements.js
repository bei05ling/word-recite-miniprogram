const wordbookService = require('../../services/wordbook');
const progressService = require('../../services/progress');
const storage = require('../../utils/storage');
const achievementUtils = require('../../utils/achievements');
const dateUtils = require('../../utils/date');
const { STORAGE_KEYS } = require('../../utils/constants');

Page({
  data: {
    loading: true,
    achievements: [],
    unlockedCount: 0,
    nextAchievement: null,
    totalLearned: 0,
    streak: 0,
    quizCount: 0,
    learnerLevel: '刚刚开始',
    levelProgress: {
      current: { title: '刚刚开始' },
      next: { title: '好奇读者', min: 1 },
      percent: 0,
      remaining: 1,
    },
    recentDays: [],
    activeDays: 0,
  },

  async onShow() {
    this.setData({ loading: true });
    const books = await wordbookService.getWordbooks();
    const allLearned = new Set();
    const studyDates = new Set();
    let quizCount = 0;
    let correctCount = 0;

    books.forEach((book) => {
      const progress = progressService.loadProgress(book.id);
      (progress.learnedWordIds || []).forEach((wordId) => allLearned.add(wordId));
      (progress.studyDates || []).forEach((date) => studyDates.add(date));
      quizCount += Number(progress.quizCount || 0);
      correctCount += Number(progress.correctCount || 0);
    });

    const mistakes = storage.get(STORAGE_KEYS.MISTAKES, {});
    const recoveredCount = Object.values(mistakes).filter(
      (item) => item.lastResult === 'correct' && Number(item.level || 0) > 0
    ).length;
    const accuracy = quizCount
      ? Math.round((correctCount / quizCount) * 100)
      : 0;
    const streak = dateUtils.calculateStreak(Array.from(studyDates));
    const totalLearned = allLearned.size;
    const achievements = achievementUtils.buildAchievements({
      totalLearned,
      streak,
      quizCount,
      accuracy,
      recoveredCount,
    });
    const locked = achievements
      .filter((item) => !item.unlocked)
      .sort((left, right) => {
        const leftRatio = left.value / left.target;
        const rightRatio = right.value / right.target;
        return rightRatio - leftRatio;
      });
    const recentDays = achievementUtils.recentActivity(28).map((day) => ({
      ...day,
      active: studyDates.has(day.key),
    }));

    this.setData({
      loading: false,
      achievements,
      unlockedCount: achievements.filter((item) => item.unlocked).length,
      nextAchievement: locked[0] || null,
      totalLearned,
      streak,
      quizCount,
      learnerLevel: achievementUtils.learnerLevel(totalLearned),
      levelProgress: achievementUtils.levelProgress(totalLearned),
      recentDays,
      activeDays: recentDays.filter((day) => day.active).length,
    });
  },

  startStudy() {
    wx.navigateTo({ url: '/pages/study/study' });
  },

  startQuiz() {
    wx.navigateTo({ url: '/pages/quiz/quiz' });
  },
});
