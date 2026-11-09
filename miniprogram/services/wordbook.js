const seed = require('../data/seed/index');
const storage = require('../utils/storage');
const cloud = require('./cloud');
const { STORAGE_KEYS } = require('../utils/constants');

const PAGE_SIZE = 4;
const LOCAL_PAGE_SIZE = 4;
const CACHE_TTL = 30 * 60 * 1000;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function allLocalWords() {
  return seed.wordbooks.reduce((rows, book) => {
    const words = seed[book.id] || [];
    return rows.concat(
      words.map((word) => ({
        ...word,
        bookId: book.id,
        bookName: book.name,
        bookLevel: book.level,
        accent: book.accent,
      }))
    );
  }, []);
}

function pageCacheKey(wordbookId, page, pageSize) {
  return `${STORAGE_KEYS.WORD_CACHE}:${wordbookId}:${page}:${pageSize}`;
}

function readPageCache(wordbookId, page, pageSize) {
  const cached = storage.get(pageCacheKey(wordbookId, page, pageSize), null);
  if (!cached || Date.now() - cached.cachedAt > CACHE_TTL) {
    return null;
  }
  return cached.result;
}

function writePageCache(wordbookId, page, pageSize, result) {
  storage.set(pageCacheKey(wordbookId, page, pageSize), {
    cachedAt: Date.now(),
    result,
  });
}

function getLocalPage(wordbookId, page, pageSize) {
  const source = seed[wordbookId] || [];
  const start = page * pageSize;
  return {
    items: clone(source.slice(start, start + pageSize)),
    page,
    pageSize,
    total: source.length,
    hasMore: start + pageSize < source.length,
    source: 'local',
  };
}

async function getWordbooks() {
  try {
    const remote = await cloud.callFunction('wordbook', { action: 'list' });
    if (Array.isArray(remote) && remote.length) {
      return remote;
    }
  } catch (error) {
    console.warn('云端词书不可用，使用本地词库', error);
  }
  return clone(seed.wordbooks);
}

async function getWords({
  wordbookId = 'cet4',
  page = 0,
  pageSize = PAGE_SIZE,
  force = false,
} = {}) {
  if (!force) {
    const cached = readPageCache(wordbookId, page, pageSize);
    if (cached) {
      return cached;
    }
  }

  try {
    const remote = await cloud.callFunction('wordbook', {
      action: 'page',
      wordbookId,
      page,
      pageSize,
    });
    if (remote && Array.isArray(remote.items) && remote.items.length) {
      const result = { ...remote, source: 'cloud' };
      writePageCache(wordbookId, page, pageSize, result);
      return result;
    }
  } catch (error) {
    console.warn('单词分页加载失败，使用本地缓存', error);
  }

  const localResult = getLocalPage(wordbookId, page, pageSize);
  writePageCache(wordbookId, page, pageSize, localResult);
  return localResult;
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

async function syncIncremental(wordbookId = 'cet4') {
  const versionKey = `${STORAGE_KEYS.WORD_CACHE}:${wordbookId}:version`;
  const sinceVersion = Number(storage.get(versionKey, 0));
  const result = await cloud.callFunction('wordbook', {
    action: 'since',
    wordbookId,
    sinceVersion,
  });
  storage.set(versionKey, result.version);
  return result;
}

function getWordbookById(wordbookId) {
  return clone(seed.wordbooks.find((book) => book.id === wordbookId) || null);
}

function getWordById(wordbookId, wordId) {
  const source = seed[wordbookId] || [];
  return clone(source.find((word) => word.id === wordId) || null);
}

function getRelatedWords(wordbookId, wordId, limit = 4) {
  const source = seed[wordbookId] || [];
  const index = source.findIndex((word) => word.id === wordId);
  if (index < 0) {
    return [];
  }

  return clone(
    source
      .filter((_, itemIndex) => itemIndex !== index)
      .sort((left, right) => {
        const leftDistance = Math.abs(source.indexOf(left) - index);
        const rightDistance = Math.abs(source.indexOf(right) - index);
        return leftDistance - rightDistance;
      })
      .slice(0, limit)
  );
}

function searchWords(keyword = '', options = {}) {
  const bookId = options.bookId || 'all';
  const limit = options.limit || 30;
  const normalized = String(keyword).trim().toLowerCase();
  const rows = allLocalWords().filter((word) => {
    if (bookId !== 'all' && word.bookId !== bookId) {
      return false;
    }
    if (!normalized) {
      return true;
    }
    return [
      word.word,
      word.meaning,
      word.translation,
      word.bookName,
    ].some((value) => String(value).toLowerCase().includes(normalized));
  });

  return clone(rows.slice(0, limit));
}

function getDailyWord(date = new Date()) {
  const rows = allLocalWords();
  if (!rows.length) {
    return null;
  }
  const start = new Date('2025-01-01T12:00:00').getTime();
  const today = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    12,
    0,
    0
  ).getTime();
  const offset = Math.max(0, Math.floor((today - start) / 86400000));
  return clone(rows[offset % rows.length]);
}

module.exports = {
  PAGE_SIZE,
  getWordbooks,
  getWords,
  preloadWords,
  getCachedWordbookId,
  setCachedWordbookId,
  syncIncremental,
  getWordbookById,
  getWordById,
  getRelatedWords,
  searchWords,
  getDailyWord,
};

