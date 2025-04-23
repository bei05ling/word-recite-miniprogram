function pad(value) {
  return String(value).padStart(2, '0');
}

function toDateKey(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function shiftDate(dateKey, days) {
  const date = new Date(`${dateKey}T12:00:00`);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

function getRecentDateKeys(count = 7, endDate = new Date()) {
  const keys = [];
  for (let index = count - 1; index >= 0; index -= 1) {
    const date = new Date(endDate);
    date.setDate(date.getDate() - index);
    keys.push(toDateKey(date));
  }
  return keys;
}

function calculateStreak(dateKeys = [], today = toDateKey()) {
  const dates = new Set(dateKeys);
  let cursor = dates.has(today) ? today : shiftDate(today, -1);
  let streak = 0;

  while (dates.has(cursor)) {
    streak += 1;
    cursor = shiftDate(cursor, -1);
  }

  return streak;
}

module.exports = {
  toDateKey,
  shiftDate,
  getRecentDateKeys,
  calculateStreak,
};

