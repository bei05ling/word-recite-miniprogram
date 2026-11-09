const wordbookService = require('../../services/wordbook');
const progressService = require('../../services/progress');
const favoritesService = require('../../services/favorites');

Page({
  data: {
    word: null,
    book: null,
    relatedWords: [],
    favorite: false,
    mastered: false,
    notFound: false,
  },

  onLoad(options) {
    const wordbookId =
      options.wordbookId ||
      options.bookId ||
      wordbookService.getCachedWordbookId();
    const word = wordbookService.getWordById(wordbookId, options.wordId);
    if (!word) {
      this.setData({ notFound: true });
      return;
    }
    const book = wordbookService.getWordbookById(wordbookId);
    const progress = progressService.loadProgress(wordbookId);
    const relatedWords = wordbookService.getRelatedWords(wordbookId, word.id, 4);

    this.setData({
      word,
      book,
      relatedWords,
      favorite: favoritesService.isFavorite(word.id),
      mastered: (progress.learnedWordIds || []).includes(word.id),
    });
  },

  toggleFavorite() {
    const result = favoritesService.toggleFavorite(this.data.word.id);
    this.setData({ favorite: result.favorite });
    wx.showToast({
      title: result.favorite ? '已收入收藏本' : '已移出收藏本',
      icon: 'none',
    });
  },

  markMastered() {
    if (this.data.mastered) {
      wx.showToast({ title: '这个词已经掌握', icon: 'none' });
      return;
    }
    const progress = progressService.loadProgress(this.data.book.id);
    progressService.markWordLearned(progress, this.data.word.id);
    this.setData({ mastered: true });
    wx.showToast({ title: '已标记为掌握', icon: 'success' });
  },

  openRelated(event) {
    const { id } = event.currentTarget.dataset;
    wx.redirectTo({
      url: `/pages/word-detail/word-detail?wordbookId=${this.data.book.id}&wordId=${id}`,
    });
  },

  startBook() {
    wordbookService.setCachedWordbookId(this.data.book.id);
    wx.navigateTo({ url: '/pages/study/study' });
  },

  handleAudioError() {
    wx.showToast({ title: '发音暂时不可用', icon: 'none' });
  },

  goBack() {
    wx.navigateBack({
      fail: () => wx.redirectTo({ url: '/pages/explore/explore' }),
    });
  },
});
