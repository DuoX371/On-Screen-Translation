const tesseract = require('tesseract.js')

async function imageToText(img, lang = 'jpn'){
  return await tesseract.recognize(img, lang).catch(err => console.log(err)).then((res) => res.data.text)
}

module.exports = imageToText