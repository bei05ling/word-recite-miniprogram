const storage = require('../utils/storage');
const cloud = require('./cloud');
const { STORAGE_KEYS } = require('../utils/constants');

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function defaultProgress(wordbookId = 'cet4') {
  return {
    wordbookId,
    learnedWordIds: [],
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

function loadProgress(wordbookId = 'cet4') {
  const saved = storage.get(STORAGE_KEYS.PROGRESS, null);
  if (saved && saved.wordbookId === wordbookId) {
    return saved;
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
  return next;
}

function markWordLearned(progress, wordId) {
  const learnedWordIds = Array.from(new Set([...(progress.learnedWordIds || []), wordId]));
  const studyDates = Array.from(new Set([...(progress.studyDates || []), todayKey()]));
  return saveProgress({
    ...progress,
    learnedWordIds,
    studyDates,
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
  return merged;
}

module.exports = {
  loadProgress,
  saveProgress,
  markWordLearned,
  recordQuiz,
  mergeProgress,
  syncProgress,
};

