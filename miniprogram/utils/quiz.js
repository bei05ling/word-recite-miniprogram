const { REVIEW_INTERVALS } = require('./constants');

function normalizeAnswer(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z-]/g, '');
}

function checkAnswer(answer, expected) {
  const actual = normalizeAnswer(answer);
  const target = normalizeAnswer(expected);
  return {
    correct: actual === target,
    actual,
    expected: target,
  };
}

function buildQuestion(words, index) {
  if (!words.length) {
    return null;
  }

  const safeIndex = Math.max(0, Math.min(index, words.length - 1));
  const word = words[safeIndex];
  return {
    id: word.id,
    word: word.word,
    meaning: word.meaning,
    phonetic: word.phonetic,
    clue: `${word.meaning} · ${word.phonetic}`,
    answerLength: word.word.length,
  };
}

function nextReviewState(current = {}, correct = false) {
  const previousLevel = Number(current.level || 0);
  const nextLevel = correct
    ? Math.min(previousLevel + 1, REVIEW_INTERVALS.length - 1)
    : 0;
  const intervalDays = REVIEW_INTERVALS[nextLevel];
  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + intervalDays);

  return {
    level: nextLevel,
    intervalDays,
    dueAt: dueAt.toISOString(),
    lastResult: correct ? 'correct' : 'wrong',
    updatedAt: new Date().toISOString(),
  };
}

module.exports = {
  normalizeAnswer,
  checkAnswer,
  buildQuestion,
  nextReviewState,
};

