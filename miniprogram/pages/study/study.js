const wordbookService = require('../../services/wordbook');
const progressService = require('../../services/progress');

Page({
  data: {
    loading: true,
    words: [],
    currentWord: null,
    currentIndex: 0,
    learnedIds: [],
    page: 0,
    hasMore: true,
  },

  async onLoad() {
    const wordbookId = wordbookService.getCachedWordbookId();
    const progress = progressService.loadProgress(wordbookId);
    this.setData({
      learnedIds: progress.learnedWordIds || [],
    });
    await this.loadPage(0);
  },

  async loadPage(page) {
    try {
      const result = await wordbookService.getWords({
        wordbookId: wordbookService.getCachedWordbookId(),
        page,
      });
      const known = new Set(this.data.words.map((word) => word.id));
      const nextWords = this.data.words.concat(
        result.items.filter((word) => !known.has(word.id))
      );
      const currentIndex = Math.min(this.data.currentIndex, Math.max(0, nextWords.length - 1));

      this.setData({
        loading: false,
        words: nextWords,
        currentWord: nextWords[currentIndex] || null,
        currentIndex,
        page,
        hasMore: result.hasMore,
      });
    } catch (error) {
      console.error('加载单词失败', error);
      this.setData({ loading: false });
      wx.showToast({ title: '单词加载失败', icon: 'none' });
    }
  },

  async goNext() {
    const nextIndex = this.data.currentIndex + 1;
    if (nextIndex >= this.data.words.length) {
      if (this.data.hasMore) {
        await this.loadPage(this.data.page + 1);
        const index = Math.min(nextIndex, this.data.words.length - 1);
        this.setData({
          currentIndex: index,
          currentWord: this.data.words[index],
        });
      } else {
        wx.showToast({ title: '本组单词已学完', icon: 'none' });
      }
      return;
    }

    this.setData({
      currentIndex: nextIndex,
      currentWord: this.data.words[nextIndex],
    });
  },

  goPrev() {
    if (this.data.currentIndex === 0) {
      return;
    }
    const previousIndex = this.data.currentIndex - 1;
    this.setData({
      currentIndex: previousIndex,
      currentWord: this.data.words[previousIndex],
    });
  },

  markMastered(event) {
    const { wordId } = event.detail;
    if (!wordId) {
      return;
    }
    const progress = progressService.loadProgress(wordbookService.getCachedWordbookId());
    const nextProgress = progressService.markWordLearned(progress, wordId);
    progressService.syncProgress(nextProgress).catch(() => {});
    this.setData({
      learnedIds: nextProgress.learnedWordIds,
    });
    wx.showToast({ title: '已标记掌握', icon: 'success' });
  },

  handleAudioError() {
    wx.showToast({ title: '发音加载失败', icon: 'none' });
  },

  finish() {
    wx.navigateBack({
      fail: () => wx.redirectTo({ url: '/pages/index/index' }),
    });
  },
});

