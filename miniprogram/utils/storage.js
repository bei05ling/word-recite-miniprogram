const PREFIX = 'word-recite:';

function buildKey(key) {
  return `${PREFIX}${key}`;
}

function get(key, fallback = null) {
  try {
    const value = wx.getStorageSync(buildKey(key));
    return value === '' || value === undefined ? fallback : value;
  } catch (error) {
    console.warn('读取缓存失败', key, error);
    return fallback;
  }
}

function set(key, value) {
  try {
    wx.setStorageSync(buildKey(key), value);
    return true;
  } catch (error) {
    console.warn('写入缓存失败', key, error);
    return false;
  }
}

function remove(key) {
  wx.removeStorageSync(buildKey(key));
}

module.exports = {
  get,
  set,
  remove,
};

