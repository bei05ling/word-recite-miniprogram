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
    attached() {
      const context = audioService.getAudioContext();
      context.onPlay(() => this.setData({ playing: true }));
      context.onEnded(() => this.setData({ playing: false }));
      context.onError((error) => {
        this.setData({ playing: false });
        this.triggerEvent('error', error);
      });
    },
    detached() {
      this.setData({ playing: false });
    },
  },

  methods: {
    play() {
      if (!this.data.word) {
        return;
      }
      try {
        audioService.playWord(this.data.word);
        this.triggerEvent('play', { word: this.data.word });
      } catch (error) {
        this.triggerEvent('error', { message: error.message });
      }
    },
  },
});

