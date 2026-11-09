const storage = require('../utils/storage');
const { STORAGE_KEYS } = require('../utils/constants');

function getFavoriteIds() {
  const ids = storage.get(STORAGE_KEYS.FAVORITES, []);
  return Array.isArray(ids) ? ids : [];
}

function isFavorite(wordId) {
  return getFavoriteIds().includes(wordId);
}

function toggleFavorite(wordId) {
  const ids = getFavoriteIds();
  const exists = ids.includes(wordId);
  const next = exists ? ids.filter((id) => id !== wordId) : [wordId, ...ids];
  storage.set(STORAGE_KEYS.FAVORITES, next);
  return {
    favorite: !exists,
    count: next.length,
  };
}

function removeFavorite(wordId) {
  const next = getFavoriteIds().filter((id) => id !== wordId);
  storage.set(STORAGE_KEYS.FAVORITES, next);
  return next;
}

module.exports = {
  getFavoriteIds,
  isFavorite,
  toggleFavorite,
  removeFavorite,
};
