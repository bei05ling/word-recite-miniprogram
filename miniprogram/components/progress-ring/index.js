Component({
  properties: {
    percent: {
      type: Number,
      value: 0,
      observer(value) {
        const safePercent = Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
        this.setData({
          displayPercent: safePercent,
          ringStyle: `background: conic-gradient(#2f6b4f ${safePercent * 3.6}deg, #e6e1d7 0deg);`,
        });
      },
    },
    caption: {
      type: String,
      value: '今日进度',
    },
  },

  data: {
    displayPercent: 0,
    ringStyle: 'background: conic-gradient(#2f6b4f 0deg, #e6e1d7 0deg);',
  },
});

