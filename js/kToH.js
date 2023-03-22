const fetch = require('node-fetch');

const data = {
  app_id: '705af2444eec43e9bdf6e239f1cce317dffc5cd381b1bf69f7788c1db06b0a93',
  output_type: 'hiragana'
}
async function kanjiToHiragana(text){
  data['sentence'] = text
  return await fetch('https://labs.goo.ne.jp/api/hiragana', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  }).then(res => res.json())
  .then(res => res.converted)
}

module.exports = kanjiToHiragana