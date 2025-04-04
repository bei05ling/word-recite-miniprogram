const STORAGE_KEYS = {
  SETTINGS: 'settings',
  PROGRESS: 'progress',
  CURRENT_WORDBOOK: 'current-wordbook',
  MISTAKES: 'mistakes',
  WORD_CACHE: 'word-cache',
};

const DEFAULT_SETTINGS = {
  dailyGoal: 20,
  autoPronounce: true,
  currentWordbookId: 'cet4',
};

const REVIEW_INTERVALS = [0, 1, 3, 7, 14, 30];

module.exports = {
  STORAGE_KEYS,
  DEFAULT_SETTINGS,
  REVIEW_INTERVALS,
};

