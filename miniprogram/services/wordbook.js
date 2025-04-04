const wordbooks = require('../data/seed/wordbooks.json');
const cet4Words = require('../data/seed/cet4.json');
const storage = require('../utils/storage');
const { STORAGE_KEYS } = require('../utils/constants');

const PAGE_SIZE = 4;
const LOCAL_PAGE_SIZE = 4;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

async function getWordbooks() {
  return clone(wordbooks);
}

async function getWords({ wordbookId = 'cet4', page = 0, pageSize = PAGE_SIZE } = {}) {
  const source = wordbookId === 'cet4' ? cet4Words : [];
  const start = page * pageSize;
  return {
    items: clone(source.slice(start, start + pageSize)),
    page,
    pageSize,
    total: source.length,
    hasMore: start + pageSize < source.length,
  };
}

async function preloadWords(wordbookId = 'cet4', pages = 2) {
  for (let page = 0; page < pages; page += 1) {
    await getWords({
      wordbookId,
      page,
      pageSize: LOCAL_PAGE_SIZE,
    });
  }
}

function getCachedWordbookId() {
  return storage.get(STORAGE_KEYS.CURRENT_WORDBOOK, 'cet4');
}

function setCachedWordbookId(wordbookId) {
  storage.set(STORAGE_KEYS.CURRENT_WORDBOOK, wordbookId);
}

module.exports = {
  PAGE_SIZE,
  getWordbooks,
  getWords,
  preloadWords,
  getCachedWordbookId,
  setCachedWordbookId,
};

