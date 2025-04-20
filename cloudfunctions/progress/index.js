const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

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

  if (action !== 'save' || !progress) {
    return { ok: false, message: '无效的进度操作' };
  }

  const payload = {
    ...progress,
    _openid: OPENID,
    updatedAt: db.serverDate(),
  };
  const existing = await collection.where({ _openid: OPENID }).limit(1).get();

  if (existing.data.length) {
    await collection.doc(existing.data[0]._id).update({ data: payload });
  } else {
    await collection.add({ data: payload });
  }

  return {
    ok: true,
    data: {
      savedAt: new Date().toISOString(),
      version: progress.version,
    },
  };
};

