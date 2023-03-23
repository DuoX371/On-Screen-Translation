const fetch = require('node-fetch');

const data = {
  app_id: '',
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