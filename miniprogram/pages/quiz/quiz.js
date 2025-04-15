const wordbookService = require('../../services/wordbook');
const progressService = require('../../services/progress');
const cloud = require('../../services/cloud');
const storage = require('../../utils/storage');
const quizUtils = require('../../utils/quiz');
const { STORAGE_KEYS } = require('../../utils/constants');

function shuffle(items) {
  return items
    .map((item) => ({ item, order: Math.random() }))
    .sort((left, right) => left.order - right.order)
    .map(({ item }) => item);
}

Page({
  data: {
    loading: true,
    words: [],
    question: null,
    questionIndex: 0,
    answer: '',
    result: null,
    score: 0,
    finished: false,
  },

  async onLoad() {
    const result = await wordbookService.getWords({
      wordbookId: wordbookService.getCachedWordbookId(),
      page: 0,
      pageSize: 100,
    });
    const words = shuffle(result.items).slice(0, 5);
    this.setData({
      loading: false,
      words,
      question: quizUtils.buildQuestion(words, 0),
    });
  },

  handleInput(event) {
    this.setData({ answer: event.detail.value });
  },

  submit() {
    if (!this.data.question || this.data.result) {
      return;
    }

    const result = quizUtils.checkAnswer(this.data.answer, this.data.question.word);
    const score = this.data.score + (result.correct ? 1 : 0);
    const progress = progressService.loadProgress(wordbookService.getCachedWordbookId());
    const nextProgress = progressService.recordQuiz(progress, result.correct);

    if (!result.correct) {
      this.saveMistake(this.data.question, false);
    }

    this.setData({ result: result.correct ? 'correct' : 'wrong', score });
    progressService.syncProgress(nextProgress).catch(() => {});
    cloud
      .callFunction('quiz', {
        action: 'grade',
        wordId: this.data.question.id,
        answer: this.data.answer,
      })
      .catch(() => {});
  },

  saveMistake(question, correct) {
    const mistakes = storage.get(STORAGE_KEYS.MISTAKES, {});
    const existing = mistakes[question.id] || {};
    const nextState = quizUtils.nextReviewState(existing, correct);
    mistakes[question.id] = {
      ...existing,
      id: question.id,
      word: question.word,
      meaning: question.meaning,
      phonetic: question.phonetic,
      ...nextState,
    };
    storage.set(STORAGE_KEYS.MISTAKES, mistakes);
  },

  next() {
    const nextIndex = this.data.questionIndex + 1;
    if (nextIndex >= this.data.words.length) {
      this.setData({ finished: true });
      return;
    }
    this.setData({
      questionIndex: nextIndex,
      question: quizUtils.buildQuestion(this.data.words, nextIndex),
      answer: '',
      result: null,
    });
  },

  restart() {
    const words = shuffle(this.data.words);
    this.setData({
      words,
      question: quizUtils.buildQuestion(words, 0),
      questionIndex: 0,
      answer: '',
      result: null,
      score: 0,
      finished: false,
    });
  },
});

