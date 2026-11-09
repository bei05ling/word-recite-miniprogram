const wordbookService = require('../../services/wordbook');
const progressService = require('../../services/progress');
const storage = require('../../utils/storage');
const dateUtils = require('../../utils/date');
const achievementUtils = require('../../utils/achievements');
const {
  STORAGE_KEYS,
  DEFAULT_SETTINGS,
  DEFAULT_PROFILE,
} = require('../../utils/constants');

Page({
  data: {
    loading: true,
    editingProfile: false,
    wordbooks: [],
    currentWordbookId: 'cet4',
    currentBook: null,
    currentBookProgress: 0,
    profile: DEFAULT_PROFILE,
    profileDraft: '',
    noteDraft: '',
    avatarText: '词',
    settings: DEFAULT_SETTINGS,
    goalOptions: [10, 20, 30, 50],
    dailyGoalIndex: 1,
    learnerLevel: '刚刚开始',
    levelProgress: null,
    joinedDays: 1,
    totalLearned: 0,
    accuracy: 0,
    streak: 0,
    dueCount: 0,
    achievements: [],
  },

  onShow() {
    this.loadProfile();
  },

  async loadProfile() {
    this.setData({ loading: true });
    try {
      const wordbooks = await wordbookService.getWordbooks();
      const currentWordbookId = wordbookService.getCachedWordbookId();
      const profile = {
        ...DEFAULT_PROFILE,
        ...storage.get(STORAGE_KEYS.PROFILE, {}),
      };
      const settings = {
        ...DEFAULT_SETTINGS,
        ...storage.get(STORAGE_KEYS.SETTINGS, {}),
      };
      const allLearned = new Set();
      const studyDates = new Set();
      let quizCount = 0;
      let correctCount = 0;

      const library = wordbooks.map((book) => {
        const progress = progressService.loadProgress(book.id);
        (progress.learnedWordIds || []).forEach((wordId) => allLearned.add(wordId));
        (progress.studyDates || []).forEach((date) => studyDates.add(date));
        quizCount += Number(progress.quizCount || 0);
        correctCount += Number(progress.correctCount || 0);
        const learnedCount = (progress.learnedWordIds || []).length;
        return {
          ...book,
          learnedCount,
          progress: book.totalWords
            ? Math.min(100, Math.round((learnedCount / book.totalWords) * 100))
            : 0,
        };
      });

      const currentBook =
        library.find((book) => book.id === currentWordbookId) || library[0];
      const currentProgress = currentBook
        ? progressService.loadProgress(currentBook.id)
        : null;
      const mistakes = storage.get(STORAGE_KEYS.MISTAKES, {});
      const now = Date.now();
      const dueCount = Object.values(mistakes).filter(
        (item) => !item.dueAt || new Date(item.dueAt).getTime() <= now
      ).length;
      const recoveredCount = Object.values(mistakes).filter(
        (item) => item.lastResult === 'correct' && Number(item.level || 0) > 0
      ).length;
      const accuracy = quizCount
        ? Math.round((correctCount / quizCount) * 100)
        : 0;
      const streak = dateUtils.calculateStreak(Array.from(studyDates));
      const totalLearned = allLearned.size;

      this.setData({
        loading: false,
        wordbooks,
        currentWordbookId: currentBook ? currentBook.id : 'cet4',
        currentBook,
        currentBookProgress: currentProgress
          ? Math.min(
              100,
              Math.round(
                ((currentProgress.learnedWordIds || []).length /
                  Math.max(1, currentBook.totalWords)) *
                  100
              )
            )
          : 0,
        profile,
        avatarText: profile.nickname.slice(0, 1) || '词',
        settings,
        dailyGoalIndex: Math.max(0, this.data.goalOptions.indexOf(settings.dailyGoal)),
        learnerLevel: achievementUtils.learnerLevel(totalLearned),
        levelProgress: achievementUtils.levelProgress(totalLearned),
        joinedDays: achievementUtils.joinedDays(Array.from(studyDates)),
        totalLearned,
        accuracy,
        streak,
        dueCount,
        achievements: achievementUtils.buildAchievements({
          totalLearned,
          streak,
          quizCount,
          accuracy,
          recoveredCount,
        }),
      });
    } catch (error) {
      console.error('加载个人中心失败', error);
      this.setData({ loading: false });
      wx.showToast({ title: '个人数据加载失败', icon: 'none' });
    }
  },

  beginEditProfile() {
    this.setData({
      editingProfile: true,
      profileDraft: this.data.profile.nickname,
      noteDraft: this.data.profile.note,
    });
  },

  toggleProfileEditor() {
    if (this.data.editingProfile) {
      this.cancelEditProfile();
      return;
    }
    this.beginEditProfile();
  },

  cancelEditProfile() {
    this.setData({ editingProfile: false });
  },

  updateNicknameDraft(event) {
    this.setData({ profileDraft: event.detail.value });
  },

  updateNoteDraft(event) {
    this.setData({ noteDraft: event.detail.value });
  },

  saveProfile() {
    const nickname = this.data.profileDraft.trim();
    const note = this.data.noteDraft.trim();
    if (!nickname) {
      wx.showToast({ title: '昵称不能为空', icon: 'none' });
      return;
    }
    const profile = {
      nickname,
      note: note || DEFAULT_PROFILE.note,
    };
    storage.set(STORAGE_KEYS.PROFILE, profile);
    this.setData({
      profile,
      avatarText: nickname.slice(0, 1),
      editingProfile: false,
    });
    wx.showToast({ title: '个人资料已更新', icon: 'success' });
  },

  selectWordbook(event) {
    const { id } = event.currentTarget.dataset;
    if (id === this.data.currentWordbookId) {
      return;
    }
    const selected = this.data.wordbooks.find((book) => book.id === id);
    if (!selected) {
      return;
    }
    wordbookService.setCachedWordbookId(id);
    wx.showToast({ title: `已切换到${selected.name}`, icon: 'success' });
    this.loadProfile();
  },

  updateDailyGoal(event) {
    const settings = {
      ...this.data.settings,
      dailyGoal: Number(event.detail.value),
    };
    storage.set(STORAGE_KEYS.SETTINGS, settings);
    this.setData({
      settings,
      dailyGoalIndex: Number(event.detail.value),
    });
  },

  toggleAutoPronounce(event) {
    const settings = {
      ...this.data.settings,
      autoPronounce: Boolean(event.detail.value),
    };
    storage.set(STORAGE_KEYS.SETTINGS, settings);
    this.setData({ settings });
  },

  toggleHaptic(event) {
    const hapticFeedback = Boolean(event.detail.value);
    const settings = {
      ...this.data.settings,
      hapticFeedback,
    };
    storage.set(STORAGE_KEYS.SETTINGS, settings);
    this.setData({ settings });
    if (hapticFeedback && wx.vibrateShort) {
      wx.vibrateShort({ type: 'light' });
    }
  },

  openStats() {
    wx.navigateTo({ url: '/pages/stats/stats' });
  },

  openAchievements() {
    wx.navigateTo({ url: '/pages/achievements/achievements' });
  },

  openNotebook() {
    wx.navigateTo({ url: '/pages/notebook/notebook' });
  },

  openSearch() {
    wx.navigateTo({ url: '/pages/search/search' });
  },

  openLibrary() {
    wx.navigateTo({ url: '/pages/library/library' });
  },

  openMistakes() {
    wx.navigateTo({ url: '/pages/mistakes/mistakes' });
  },

  startStudy() {
    wx.navigateTo({ url: '/pages/study/study' });
  },

  startQuiz() {
    wx.navigateTo({ url: '/pages/quiz/quiz' });
  },
});
