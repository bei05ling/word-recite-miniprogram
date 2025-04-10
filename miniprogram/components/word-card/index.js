Component({
  properties: {
    word: {
      type: Object,
      value: null,
      observer() {
        this.setData({ flipped: false });
      },
    },
    mastered: {
      type: Boolean,
      value: false,
    },
  },

  data: {
    flipped: false,
  },

  methods: {
    flip() {
      const flipped = !this.data.flipped;
      this.setData({ flipped });
      this.triggerEvent('flip', { flipped });
    },

    toggleMastered() {
      this.triggerEvent('mastered', {
        wordId: this.data.word && this.data.word.id,
        mastered: !this.data.mastered,
      });
    },
  },
});

