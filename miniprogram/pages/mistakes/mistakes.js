const storage = require('../../utils/storage');
const quizUtils = require('../../utils/quiz');
const { STORAGE_KEYS } = require('../../utils/constants');

Page({
  data: {
    mistakes: [],
    currentIndex: 0,
    current: null,
    revealed: false,
    dueCount: 0,
  },

  onShow() {
    this.loadMistakes();
  },

  loadMistakes() {
    const mistakeMap = storage.get(STORAGE_KEYS.MISTAKES, {});
    const now = Date.now();
    const mistakes = Object.values(mistakeMap)
      .map((item) => ({
        ...item,
        due: !item.dueAt || new Date(item.dueAt).getTime() <= now,
      }))
      .sort((left, right) => {
        if (left.due !== right.due) {
          return left.due ? -1 : 1;
        }
        return new Date(left.dueAt || 0) - new Date(right.dueAt || 0);
      });

    this.setData({
      mistakes,
      currentIndex: 0,
      current: mistakes[0] || null,
      revealed: false,
      dueCount: mistakes.filter((item) => item.due).length,
    });
  },

  reveal() {
    this.setData({ revealed: true });
  },

  answer(event) {
    const correct = event.currentTarget.dataset.correct === true;
    const current = this.data.current;
    if (!current) {
      return;
    }

    const mistakeMap = storage.get(STORAGE_KEYS.MISTAKES, {});
    const nextState = quizUtils.nextReviewState(current, correct);
    mistakeMap[current.id] = {
      ...current,
      ...nextState,
      dueAt: nextState.dueAt,
    };
    storage.set(STORAGE_KEYS.MISTAKES, mistakeMap);

    const nextIndex = this.data.currentIndex + 1;
    const next = this.data.mistakes[nextIndex] || null;
    this.setData({
      currentIndex: nextIndex,
      current: next,
      revealed: false,
    });
  },

  goStudy() {
    wx.navigateTo({ url: '/pages/study/study' });
  },
});

