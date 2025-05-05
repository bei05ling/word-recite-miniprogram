const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

exports.main = async (event) => {
  const {
    action = 'list',
    wordbookId = 'cet4',
    page = 0,
    pageSize = 20,
    sinceVersion = 0,
  } = event;

  if (action === 'list') {
    const result = await db.collection('wordbooks').orderBy('sort', 'asc').get();
    return {
      ok: true,
      data: result.data,
    };
  }

  if (action === 'page') {
    const safePage = Math.max(0, Number(page));
    const safeSize = Math.min(50, Math.max(1, Number(pageSize)));
    const collection = db.collection('words').where({ wordbookId });
    const [countResult, wordsResult] = await Promise.all([
      collection.count(),
      collection
        .orderBy('sort', 'asc')
        .skip(safePage * safeSize)
        .limit(safeSize)
        .get(),
    ]);

    return {
      ok: true,
      data: {
        items: wordsResult.data,
        page: safePage,
        pageSize: safeSize,
        total: countResult.total,
        hasMore: (safePage + 1) * safeSize < countResult.total,
      },
    };
  }

  if (action === 'since') {
    const result = await db
      .collection('words')
      .where({
        wordbookId,
        version: db.command.gt(Number(sinceVersion) || 0),
      })
      .orderBy('sort', 'asc')
      .limit(100)
      .get();
    const latestVersion = result.data.reduce(
      (latest, word) => Math.max(latest, Number(word.version || 0)),
      Number(sinceVersion) || 0
    );
    return {
      ok: true,
      data: {
        items: result.data,
        version: latestVersion,
        hasMore: result.data.length === 100,
      },
    };
  }

  return { ok: false, message: '不支持的词书操作' };
};

