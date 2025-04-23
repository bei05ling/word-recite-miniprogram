Component({
  properties: {
    title: {
      type: String,
      value: '这里还没有内容',
    },
    description: {
      type: String,
      value: '完成一次学习后，数据会出现在这里。',
    },
    actionText: {
      type: String,
      value: '',
    },
  },

  methods: {
    handleAction() {
      this.triggerEvent('action');
    },
  },
});

