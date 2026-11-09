const dateUtils = require('./date');

const LEVELS = [
  { min: 0, title: '刚刚开始' },
  { min: 1, title: '好奇读者' },
  { min: 10, title: '稳定练习者' },
  { min: 30, title: '词汇进阶者' },
  { min: 60, title: '长期主义者' },
  { min: 100, title: '百词收藏家' },
];

function learnerLevel(totalLearned) {
  return [...LEVELS]
    .reverse()
    .find((level) => totalLearned >= level.min).title;
}

function levelProgress(totalLearned) {
  const currentIndex = Math.max(
    0,
    LEVELS.findIndex((level, index) => {
      const next = LEVELS[index + 1];
      return !next || totalLearned < next.min;
    })
  );
  const current = LEVELS[currentIndex];
  const next = LEVELS[currentIndex + 1] || null;
  const span = next ? next.min - current.min : 1;
  const progressed = totalLearned - current.min;
  return {
    current,
    next,
    percent: next
      ? Math.min(100, Math.round((progressed / span) * 100))
      : 100,
    remaining: next ? Math.max(0, next.min - totalLearned) : 0,
  };
}

function joinedDays(studyDates) {
  if (!studyDates.length) {
    return 1;
  }
  const first = [...studyDates].sort()[0];
  const firstDate = new Date(`${first}T12:00:00`);
  const today = new Date(`${dateUtils.toDateKey()}T12:00:00`);
  return Math.max(1, Math.floor((today - firstDate) / 86400000) + 1);
}

function buildAchievements({
  totalLearned,
  streak,
  quizCount,
  accuracy,
  recoveredCount = 0,
}) {
  const items = [
    {
      id: 'first-word',
      mark: '一',
      title: '第一次翻开',
      description: '掌握第一个单词',
      value: totalLearned,
      target: 1,
    },
    {
      id: 'ten-words',
      mark: '十',
      title: '十个脚印',
      description: '累计掌握十个单词',
      value: totalLearned,
      target: 10,
    },
    {
      id: 'thirty-words',
      mark: '卅',
      title: '建立词库',
      description: '累计掌握三十个单词',
      value: totalLearned,
      target: 30,
    },
    {
      id: 'three-days',
      mark: '久',
      title: '连续三天',
      description: '连续学习三天',
      value: streak,
      target: 3,
    },
    {
      id: 'seven-days',
      mark: '周',
      title: '完整一周',
      description: '连续学习七天',
      value: streak,
      target: 7,
    },
    {
      id: 'ten-quizzes',
      mark: '测',
      title: '愿意被检验',
      description: '完成十道拼写测试',
      value: quizCount,
      target: 10,
    },
    {
      id: 'accurate',
      mark: '准',
      title: '记忆准确',
      description: '测试达到十题且正确率超过八成',
      value: accuracy,
      target: 80,
      qualified: quizCount >= 10,
    },
    {
      id: 'recovered',
      mark: '回',
      title: '把遗忘找回来',
      description: '让三个错词重新回到记忆',
      value: recoveredCount,
      target: 3,
    },
  ];

  return items.map((item) => ({
    ...item,
    unlocked:
      item.qualified === false ? false : item.value >= item.target,
    progressPercent: Math.min(
      100,
      Math.round((item.value / item.target) * 100)
    ),
    progressText:
      item.id === 'accurate'
        ? `${item.value}%`
        : `${Math.min(item.value, item.target)}/${item.target}`,
  }));
}

function recentActivity(days = 28) {
  return dateUtils.getRecentDateKeys(days).map((key) => ({
    key,
    day: Number(key.slice(-2)),
  }));
}

module.exports = {
  LEVELS,
  learnerLevel,
  levelProgress,
  joinedDays,
  buildAchievements,
  recentActivity,
};
