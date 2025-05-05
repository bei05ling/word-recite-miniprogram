const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

function mergeProgress(local, remote) {
  if (!remote) {
    return local;
  }

  return {
    ...remote,
    ...local,
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

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const { action = 'get', progress } = event;
  const collection = db.collection('progress');

  if (action === 'get') {
    const result = await collection.where({ _openid: OPENID }).limit(1).get();
    return {
      ok: true,
      data: result.data[0] || null,
    };
  }

  if (!['save', 'merge'].includes(action) || !progress) {
    return { ok: false, message: '无效的进度操作' };
  }

  const existing = await collection.where({ _openid: OPENID }).limit(1).get();
  const remoteProgress = existing.data[0] || null;
  const mergedProgress =
    action === 'merge' ? mergeProgress(progress, remoteProgress) : progress;
  const payload = {
    ...mergedProgress,
    _openid: OPENID,
    updatedAt: db.serverDate(),
  };

  if (existing.data.length) {
    const { _id, _openid, ...updateData } = payload;
    await collection.doc(existing.data[0]._id).update({ data: updateData });
  } else {
    await collection.add({ data: payload });
  }

  return {
    ok: true,
    data: mergedProgress,
  };
};

