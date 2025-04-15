const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

function normalize(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z-]/g, '');
}

exports.main = async (event) => {
  const { action, wordId, answer } = event;
  if (action !== 'grade' || !wordId) {
    return { ok: false, message: '不支持的测试操作' };
  }

  const wordResult = await db.collection('words').doc(wordId).get();
  const expected = normalize(wordResult.data.word);
  const actual = normalize(answer);

  return {
    ok: true,
    data: {
      correct: expected === actual,
      expected,
    },
  };
};

