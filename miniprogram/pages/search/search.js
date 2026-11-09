const wordbookService = require('../../services/wordbook');

Page({
  data: {
    query: '',
    activeBook: 'all',
    filters: [
      { id: 'all', name: '全部' },
      { id: 'cet4', name: '四级' },
      { id: 'campus', name: '校园' },
      { id: 'travel', name: '旅行' },
      { id: 'business', name: '职场' },
    ],
    results: [],
    resultCount: 0,
  },

  onLoad(options = {}) {
    const query = options.query ? decodeURIComponent(options.query) : '';
    this.setData({ query });
    this.refreshResults();
  },

  handleInput(event) {
    this.setData({ query: event.detail.value });
    this.refreshResults(event.detail.value, this.data.activeBook);
  },

  selectFilter(event) {
    const bookId = event.currentTarget.dataset.id;
    this.setData({ activeBook: bookId });
    this.refreshResults(this.data.query, bookId);
  },

  clearSearch() {
    this.setData({ query: '' });
    this.refreshResults('', this.data.activeBook);
  },

  refreshResults(query = this.data.query, bookId = this.data.activeBook) {
    const results = wordbookService.searchWords(query, {
      bookId,
      limit: 50,
    });
    this.setData({
      results,
      resultCount: results.length,
    });
  },

  openWord(event) {
    const { bookId, wordId } = event.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/word-detail/word-detail?bookId=${bookId}&wordId=${wordId}`,
    });
  },
});
