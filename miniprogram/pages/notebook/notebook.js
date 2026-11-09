const wordbookService = require('../../services/wordbook');
const favoritesService = require('../../services/favorites');

function hydrateWord(wordId) {
  const bookId = wordId.slice(0, wordId.lastIndexOf('-'));
  const word = wordbookService.getWordById(bookId, wordId);
  const book = wordbookService.getWordbookById(bookId);
  if (!word || !book) {
    return null;
  }
  return {
    ...word,
    bookId,
    bookName: book.name,
    bookLevel: book.level,
    accent: book.accent,
  };
}

Page({
  data: {
    words: [],
    bookCount: 0,
  },

  onShow() {
    const words = favoritesService
      .getFavoriteIds()
      .map(hydrateWord)
      .filter(Boolean);
    this.setData({
      words,
      bookCount: new Set(words.map((word) => word.bookId)).size,
    });
  },

  openWord(event) {
    const { id, bookid } = event.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/word-detail/word-detail?wordbookId=${bookid}&wordId=${id}`,
    });
  },

  removeWord(event) {
    const { id } = event.currentTarget.dataset;
    favoritesService.removeFavorite(id);
    const words = this.data.words.filter((word) => word.id !== id);
    this.setData({
      words,
      bookCount: new Set(words.map((word) => word.bookId)).size,
    });
    wx.showToast({ title: '已移出收藏本', icon: 'none' });
  },

  openExplore() {
    wx.navigateTo({ url: '/pages/explore/explore' });
  },
});
