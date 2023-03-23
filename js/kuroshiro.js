const Kuroshiro = require('kuroshiro');
const KuromojiAnalyzer = require('kuroshiro-analyzer-kuromoji');
const kuroshiro = new Kuroshiro.default();

(async ()=> { await kuroshiro.init(new KuromojiAnalyzer());})()
async function kToF(text){
  return await kuroshiro.convert(text, { to: 'hiragana', mode: 'furigana' })
}

module.exports = kToF