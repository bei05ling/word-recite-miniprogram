let audioContext = null;
let audioOptionReady = false;
let pendingWord = '';
let audioStarted = false;

function configureAudioOption() {
  if (audioOptionReady || typeof wx.setInnerAudioOption !== 'function') {
    return;
  }
  wx.setInnerAudioOption({
    obeyMuteSwitch: false,
    mixWithOther: true,
  });
  audioOptionReady = true;
}

function getAudioContext() {
  if (!audioContext) {
    configureAudioOption();
    audioContext = wx.createInnerAudioContext();
    audioContext.autoplay = false;
    audioContext.obeyMuteSwitch = false;
    audioContext.volume = 1;
    audioContext.onPlay(() => {
      pendingWord = '';
      audioStarted = true;
    });
    audioContext.onCanplay(() => {
      if (pendingWord) {
        audioContext.play();
      }
    });
  }
  return audioContext;
}

function getTtsUrl(word) {
  return `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(word)}&type=2`;
}

function playWord(word) {
  const context = getAudioContext();
  pendingWord = word;
  audioStarted = false;
  context.stop();
  context.src = getTtsUrl(word);
  context.play();

  // iOS 在首次设置 src 后可能尚未进入 canplay，用户手势内补一次播放。
  setTimeout(() => {
    if (pendingWord === word && !audioStarted) {
      context.play();
    }
  }, 120);

  return context;
}

function stop() {
  pendingWord = '';
  if (audioContext) {
    audioContext.stop();
  }
}

module.exports = {
  getAudioContext,
  getTtsUrl,
  playWord,
  stop,
};

