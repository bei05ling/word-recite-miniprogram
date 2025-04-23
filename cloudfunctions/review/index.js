const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const INTERVALS = [0, 1, 3, 7, 14, 30];

function nextState(current, correct) {
  const level = correct ? Math.min(Number(current.level || 0) + 1, 5) : 0;
  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + INTERVALS[level]);
  return {
    level,
    intervalDays: INTERVALS[level],
    dueAt,
    updatedAt: new Date(),
  };
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const { action = 'due', mistakeId, correct = false } = event;
  const collection = db.collection('mistakes');

  if (action === 'due') {
    const result = await collection
      .where({
        _openid: OPENID,
        dueAt: db.command.lte(new Date()),
      })
      .orderBy('dueAt', 'asc')
      .limit(20)
      .get();
    return { ok: true, data: result.data };
  }

  if (action !== 'answer' || !mistakeId) {
    return { ok: false, message: '无效的复习操作' };
  }

  const existing = await collection.doc(mistakeId).get();
  const next = nextState(existing.data, correct);
  await collection.doc(mistakeId).update({ data: next });

  return {
    ok: true,
    data: next,
  };
};

