const fetch = require('node-fetch')
const config = require('../config.js')

async function easyOCR(img) {
  const serverI = config.ocrServer.selected
  const server = config.ocrServer.serverList[serverI]
  const lang = config.translate.from
  let data
  if (server.includes('tomofi-easyocr')) {
    data = JSON.stringify({
      data: [
        img,
        [lang, 'en']
      ]
    })
  } else if (server.includes('api.yewonkim.tk')) {
    data = JSON.stringify({
      image: img,
      lang
    })
  }
  const res = await fetch(server, {
    method: "POST",
    body: data,
    headers: { "Content-Type": "application/json" }
  }).then(e => {
    try {
      return e.json()
    } catch (f) {
      console.error(f)
    }
  }).catch(console.error)

  if (!res) return

  return {res, serverI}
}

module.exports = easyOCR