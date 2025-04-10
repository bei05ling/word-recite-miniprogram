let audioContext = null;

function getAudioContext() {
  if (!audioContext) {
    audioContext = wx.createInnerAudioContext();
    audioContext.autoplay = false;
    audioContext.obeyMuteSwitch = false;
  }
  return audioContext;
}

function getTtsUrl(word) {
  return `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(word)}&type=2`;
}

function playWord(word) {
  const context = getAudioContext();
  context.stop();
  context.src = getTtsUrl(word);
  context.play();
  return context;
}

function stop() {
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

