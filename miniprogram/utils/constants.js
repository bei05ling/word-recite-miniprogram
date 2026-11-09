const STORAGE_KEYS = {
  SETTINGS: 'settings',
  PROGRESS: 'progress',
  CURRENT_WORDBOOK: 'current-wordbook',
  MISTAKES: 'mistakes',
  WORD_CACHE: 'word-cache',
  PROFILE: 'profile',
  FAVORITES: 'favorites',
};

const DEFAULT_SETTINGS = {
  dailyGoal: 20,
  autoPronounce: true,
  hapticFeedback: true,
  currentWordbookId: 'cet4',
};

const DEFAULT_PROFILE = {
  nickname: '单词旅人',
  note: '每天认识一点世界。',
};

const REVIEW_INTERVALS = [0, 1, 3, 7, 14, 30];

module.exports = {
  STORAGE_KEYS,
  DEFAULT_SETTINGS,
  DEFAULT_PROFILE,
  REVIEW_INTERVALS,
};

