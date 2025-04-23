const progressService = require('../../services/progress');
const wordbookService = require('../../services/wordbook');
const storage = require('../../utils/storage');
const dateUtils = require('../../utils/date');
const { STORAGE_KEYS } = require('../../utils/constants');

Page({
  data: {
    learnedCount: 0,
    accuracy: 0,
    streak: 0,
    mistakeCount: 0,
    weekBars: [],
  },

  onShow() {
    const progress = progressService.loadProgress(wordbookService.getCachedWordbookId());
    const mistakes = storage.get(STORAGE_KEYS.MISTAKES, {});
    const studyDates = progress.studyDates || [];
    const accuracy = progress.quizCount
      ? Math.round((progress.correctCount / progress.quizCount) * 100)
      : 0;
    const weekKeys = dateUtils.getRecentDateKeys(7);

    this.setData({
      learnedCount: (progress.learnedWordIds || []).length,
      accuracy,
      streak: dateUtils.calculateStreak(studyDates),
      mistakeCount: Object.keys(mistakes).length,
      weekBars: weekKeys.map((key) => ({
        key,
        label: key.slice(5).replace('-', '/'),
        active: studyDates.includes(key),
      })),
    });
  },
});

