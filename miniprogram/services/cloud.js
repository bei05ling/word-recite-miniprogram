const FUNCTION_TIMEOUT = 10000;
let cloudReady = false;

function ensureCloud() {
  if (!wx.cloud) {
    throw new Error('当前基础库不支持云开发');
  }

  if (typeof wx.getAccountInfoSync === 'function') {
    const accountInfo = wx.getAccountInfoSync();
    const appId = accountInfo.miniProgram.appId;
    if (!appId || appId === 'touristappid') {
      throw new Error('当前未配置正式 AppID，使用本地数据');
    }
  }

  if (!cloudReady) {
    wx.cloud.init({
      traceUser: true,
    });
    cloudReady = true;
  }
}

async function callFunction(name, data = {}) {
  ensureCloud();

  const result = await Promise.race([
    wx.cloud.callFunction({ name, data }),
    new Promise((resolve, reject) => {
      setTimeout(() => reject(new Error(`云函数 ${name} 调用超时`)), FUNCTION_TIMEOUT);
    }),
  ]);

  if (!result || !result.result) {
    throw new Error(`云函数 ${name} 未返回数据`);
  }

  if (result.result.ok === false) {
    throw new Error(result.result.message || `云函数 ${name} 执行失败`);
  }

  return result.result.data;
}

function login() {
  return callFunction('login');
}

module.exports = {
  callFunction,
  login,
};

