const { wordbooks, cet4: cet4Words } = require('../data/seed/index');
const storage = require('../utils/storage');
const cloud = require('./cloud');
const { STORAGE_KEYS } = require('../utils/constants');

const PAGE_SIZE = 4;
const LOCAL_PAGE_SIZE = 4;
const CACHE_TTL = 30 * 60 * 1000;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
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
  const source = wordbookId === 'cet4' ? cet4Words : [];
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
  return clone(wordbooks);
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

module.exports = {
  PAGE_SIZE,
  getWordbooks,
  getWords,
  preloadWords,
  getCachedWordbookId,
  setCachedWordbookId,
  syncIncremental,
};

