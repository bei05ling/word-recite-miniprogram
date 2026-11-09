const storage = require('../utils/storage');
const cloud = require('./cloud');
const { STORAGE_KEYS } = require('../utils/constants');
const { toDateKey } = require('../utils/date');

function todayKey() {
  return toDateKey();
}

function defaultProgress(wordbookId = 'cet4') {
  return {
    wordbookId,
    learnedWordIds: [],
    studiedWordIds: [],
    dailyStudied: {},
    correctCount: 0,
    quizCount: 0,
    studyDates: [],
    version: 1,
    updatedAt: new Date().toISOString(),
  };
}

function mergeProgress(local, remote) {
  if (!remote) {
    return local;
  }

  return {
    ...local,
    ...remote,
    wordbookId: local.wordbookId,
    learnedWordIds: Array.from(
      new Set([...(local.learnedWordIds || []), ...(remote.learnedWordIds || [])])
    ),
    studiedWordIds: Array.from(
      new Set([...(local.studiedWordIds || []), ...(remote.studiedWordIds || [])])
    ),
    dailyStudied: mergeDailyStudied(
      local.dailyStudied || {},
      remote.dailyStudied || {}
    ),
    studyDates: Array.from(
      new Set([...(local.studyDates || []), ...(remote.studyDates || [])])
    ),
    quizCount: Math.max(Number(local.quizCount || 0), Number(remote.quizCount || 0)),
    correctCount: Math.max(
      Number(local.correctCount || 0),
      Number(remote.correctCount || 0)
    ),
    version: Math.max(Number(local.version || 0), Number(remote.version || 0)),
  };
}

function mergeDailyStudied(local, remote) {
  const result = { ...local };
  Object.keys(remote).forEach((date) => {
    result[date] = Array.from(
      new Set([...(result[date] || []), ...(remote[date] || [])])
    );
  });
  return result;
}

function migrateLegacyDailyStudy(progress) {
  if (progress.dailyStudied) {
    return progress;
  }
  const date = todayKey();
  const learnedWordIds = progress.learnedWordIds || [];
  const studiedToday =
    learnedWordIds.length && (progress.studyDates || []).includes(date);
  return {
    ...progress,
    studiedWordIds: Array.from(
      new Set([...(progress.studiedWordIds || []), ...learnedWordIds])
    ),
    dailyStudied: studiedToday ? { [date]: learnedWordIds } : {},
  };
}

function loadProgress(wordbookId = 'cet4') {
  const bookKey = `${STORAGE_KEYS.PROGRESS}:${wordbookId}`;
  const saved = storage.get(bookKey, null);
  if (saved) {
    const migrated = migrateLegacyDailyStudy(saved);
    if (migrated !== saved) {
      storage.set(bookKey, migrated);
      storage.set(STORAGE_KEYS.PROGRESS, migrated);
    }
    return migrated;
  }

  const legacy = storage.get(STORAGE_KEYS.PROGRESS, null);
  if (legacy && legacy.wordbookId === wordbookId) {
    const migrated = migrateLegacyDailyStudy(legacy);
    storage.set(bookKey, migrated);
    return migrated;
  }

  return defaultProgress(wordbookId);
}

function saveProgress(progress) {
  const next = {
    ...progress,
    updatedAt: new Date().toISOString(),
    version: Number(progress.version || 0) + 1,
  };
  storage.set(STORAGE_KEYS.PROGRESS, next);
  storage.set(`${STORAGE_KEYS.PROGRESS}:${next.wordbookId}`, next);
  return next;
}

function getTodayStudiedIds(progress, date = todayKey()) {
  return (progress.dailyStudied && progress.dailyStudied[date]) || [];
}

function getTodayStudiedCount(progress, date = todayKey()) {
  return getTodayStudiedIds(progress, date).length;
}

function addWordToDailyStudy(progress, wordId, date = todayKey()) {
  const studiedWordIds = Array.from(
    new Set([...(progress.studiedWordIds || []), wordId])
  );
  const dailyStudied = mergeDailyStudied(progress.dailyStudied || {}, {
    [date]: [wordId],
  });
  const studyDates = Array.from(new Set([...(progress.studyDates || []), todayKey()]));
  return {
    ...progress,
    studiedWordIds,
    dailyStudied,
    studyDates,
  };
}

function markWordStudied(progress, wordId) {
  return saveProgress(addWordToDailyStudy(progress, wordId));
}

function markWordLearned(progress, wordId) {
  const studiedProgress = addWordToDailyStudy(progress, wordId);
  const learnedWordIds = Array.from(
    new Set([...(studiedProgress.learnedWordIds || []), wordId])
  );
  return saveProgress({
    ...studiedProgress,
    learnedWordIds,
  });
}

function recordQuiz(progress, correct) {
  return saveProgress({
    ...progress,
    quizCount: Number(progress.quizCount || 0) + 1,
    correctCount: Number(progress.correctCount || 0) + (correct ? 1 : 0),
  });
}

async function syncProgress(progress) {
  const remote = await cloud.callFunction('progress', {
    action: 'merge',
    progress,
  });
  const merged = mergeProgress(progress, remote);
  storage.set(STORAGE_KEYS.PROGRESS, merged);
  storage.set(`${STORAGE_KEYS.PROGRESS}:${merged.wordbookId}`, merged);
  return merged;
}

module.exports = {
  loadProgress,
  saveProgress,
  markWordLearned,
  markWordStudied,
  getTodayStudiedIds,
  getTodayStudiedCount,
  mergeDailyStudied,
  migrateLegacyDailyStudy,
  recordQuiz,
  mergeProgress,
  syncProgress,
};

