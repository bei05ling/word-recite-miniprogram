const wordbookService = require('../../services/wordbook');
const progressService = require('../../services/progress');

Page({
  data: {
    loading: true,
    wordbooks: [],
    dailyWord: null,
    dailyBook: null,
    totalWords: 0,
    totalLearned: 0,
  },

  onShow() {
    this.loadLibrary();
  },

  async loadLibrary() {
    this.setData({ loading: true });
    try {
      const books = await wordbookService.getWordbooks();
      const allLearned = new Set();
      let totalWords = 0;
      const wordbooks = books.map((book) => {
        const progress = progressService.loadProgress(book.id);
        const learnedCount = new Set(progress.learnedWordIds || []).size;
        (progress.learnedWordIds || []).forEach((wordId) => allLearned.add(wordId));
        totalWords += Number(book.totalWords || 0);
        return {
          ...book,
          learnedCount,
          progress: book.totalWords
            ? Math.min(100, Math.round((learnedCount / book.totalWords) * 100))
            : 0,
        };
      });
      const dailyWord = wordbookService.getDailyWord();
      const dailyBook = dailyWord
        ? wordbookService.getWordbookById(dailyWord.bookId)
        : null;

      this.setData({
        loading: false,
        wordbooks,
        dailyWord,
        dailyLetter: dailyWord ? dailyWord.word.slice(0, 1) : '',
        dailyBook,
        totalWords,
        totalLearned: allLearned.size,
      });
    } catch (error) {
      console.error('加载词书失败', error);
      this.setData({ loading: false });
      wx.showToast({ title: '词书加载失败', icon: 'none' });
    }
  },

  openSearch() {
    wx.navigateTo({ url: '/pages/search/search' });
  },

  openDailyWord() {
    if (!this.data.dailyWord) {
      return;
    }
    wx.navigateTo({
      url: `/pages/word-detail/word-detail?bookId=${this.data.dailyWord.bookId}&wordId=${this.data.dailyWord.id}`,
    });
  },

  startBook(event) {
    const { id } = event.currentTarget.dataset;
    wordbookService.setCachedWordbookId(id);
    wx.navigateTo({ url: '/pages/study/study' });
  },
});
