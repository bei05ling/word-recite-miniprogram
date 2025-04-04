const cloud = require('./services/cloud');

App({
  globalData: {
    user: null,
    bootstrapError: null,
    ready: null,
  },

  onLaunch() {
    this.globalData.ready = this.bootstrap();
  },

  async bootstrap() {
    try {
      const user = await cloud.login();
      this.globalData.user = user;
      return user;
    } catch (error) {
      this.globalData.bootstrapError = error;
      console.warn('云开发初始化失败，进入本地模式', error);
      return null;
    }
  },
});

