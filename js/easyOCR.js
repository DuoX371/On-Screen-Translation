const fetch = require('node-fetch')
const ocrServer = ['https://tomofi-easyocr.hf.space/api/predict/', 'https://api.yewonkim.tk/ocr/']

async function easyOCR(img, lang = 'ja') {
  // const server = ocrServer[Math.floor(Math.random() * ocrServer.length)]
  const server = ocrServer[1]
  let data
  if (server.includes('tomofi-easyocr')) {
    data = JSON.stringify({
      data: [
        img,
        [lang]
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

  return res
}

module.exports = easyOCR