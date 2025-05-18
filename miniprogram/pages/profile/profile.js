const wordbookService = require('../../services/wordbook');
const storage = require('../../utils/storage');
const { STORAGE_KEYS, DEFAULT_SETTINGS } = require('../../utils/constants');

Page({
  data: {
    wordbooks: [],
    currentWordbookId: 'cet4',
    settings: DEFAULT_SETTINGS,
    goalOptions: [10, 20, 30, 50],
    dailyGoalIndex: 1,
  },

  async onLoad() {
    const wordbooks = await wordbookService.getWordbooks();
    const currentWordbookId = wordbookService.getCachedWordbookId();
    const settings = {
      ...DEFAULT_SETTINGS,
      ...storage.get(STORAGE_KEYS.SETTINGS, {}),
    };
    this.setData({
      wordbooks,
      currentWordbookId,
      settings,
      dailyGoalIndex: Math.max(0, this.data.goalOptions.indexOf(settings.dailyGoal)),
    });
  },

  selectWordbook(event) {
    const { id } = event.currentTarget.dataset;
    const selected = this.data.wordbooks.find((book) => book.id === id);
    if (!selected || !selected.totalWords) {
      wx.showToast({ title: '该词书正在整理中', icon: 'none' });
      return;
    }
    wordbookService.setCachedWordbookId(id);
    this.setData({ currentWordbookId: id });
    wx.showToast({ title: `已切换到${selected.name}`, icon: 'success' });
  },

  updateDailyGoal(event) {
    const settings = {
      ...this.data.settings,
      dailyGoal: Number(event.detail.value),
    };
    storage.set(STORAGE_KEYS.SETTINGS, settings);
    this.setData({
      settings,
      dailyGoalIndex: Number(event.detail.value),
    });
  },

  toggleAutoPronounce(event) {
    const settings = {
      ...this.data.settings,
      autoPronounce: Boolean(event.detail.value),
    };
    storage.set(STORAGE_KEYS.SETTINGS, settings);
    this.setData({ settings });
  },

  openStats() {
    wx.navigateTo({ url: '/pages/stats/stats' });
  },
});

