const audioService = require('../../services/audio');

Component({
  properties: {
    word: {
      type: String,
      value: '',
    },
    label: {
      type: String,
      value: '听发音',
    },
  },

  data: {
    playing: false,
  },

  lifetimes: {
    detached() {
      this.setData({ playing: false });
    },
  },

  methods: {
    bindAudioEvents() {
      if (this.audioEventsBound) {
        return;
      }

      const context = audioService.getAudioContext();
      context.onPlay(() => this.setData({ playing: true }));
      context.onEnded(() => this.setData({ playing: false }));
      context.onStop(() => this.setData({ playing: false }));
      context.onError((error) => {
        this.setData({ playing: false });
        this.triggerEvent('error', error);
      });
      this.audioEventsBound = true;
    },

    play() {
      if (!this.data.word) {
        return;
      }
      try {
        // 延迟到点击手势内创建并初始化音频上下文，绕过 iOS 首次播放限制。
        this.bindAudioEvents();
        audioService.playWord(this.data.word);
        this.triggerEvent('play', { word: this.data.word });
      } catch (error) {
        this.triggerEvent('error', { message: error.message });
      }
    },
  },
});

