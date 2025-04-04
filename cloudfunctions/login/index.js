const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

exports.main = async () => {
  const { OPENID } = cloud.getWXContext();
  const users = db.collection('users');
  const existing = await users.where({ _openid: OPENID }).limit(1).get();

  if (existing.data.length) {
    return {
      ok: true,
      data: existing.data[0],
    };
  }

  const user = {
    openid: OPENID,
    createdAt: db.serverDate(),
    updatedAt: db.serverDate(),
    settings: {
      dailyGoal: 20,
      autoPronounce: true,
    },
  };
  const created = await users.add({ data: user });

  return {
    ok: true,
    data: {
      _id: created._id,
      ...user,
    },
  };
};

