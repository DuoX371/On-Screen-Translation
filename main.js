const { app, BrowserWindow, screen, ipcMain, desktopCapturer, shell } = require('electron')
const path = require('path')
const fs = require('fs')

// Tesseract and Bing Translate API
// const imageToText = require('./js/tesseract.js')
// const kanjiToHiragana = require('./js/kToH.js')
// const translate = require('./js/sugoi-translator.js')
const deepLTranslate = require('./js/deepL.js')
const easyOCR = require('./js/easyOCR.js')
const kanjiToFuri = require('./js/kuroshiro.js')

// Load the config file
const config = require('./config.js')

let screenWindow = null, translateWindow = null
async function createWindow() {
  screenWindow = new BrowserWindow({
    width: 600,
    height: 150,
    transparent: true,
    frame: false,
    resizable: true,
    title: 'Text Capturer Window',
  })
  screenWindow.loadFile('pages/index.html')
}

async function createTranslatePage() {
  translateWindow = new BrowserWindow({
    width: 700,
    height: 350,
    transparent: true,
    frame: false,
    resizable: true,
    title: 'OST Main Window',
    webPreferences: {
      preload: path.join(__dirname, 'preload/translate.js'),
      additionalArguments: [JSON.stringify(config)]
    }
  })

  await translateWindow.loadFile('pages/translate.html')
}

app.on('ready', async () => {
  await createTranslatePage()
  await createWindow()

  // Close the app when any of the windows are closed
  screenWindow.on('closed', () => app.quit())
  translateWindow.on('closed', () => app.quit())

  // Restore translate window when screen window is shown
  screenWindow.on('restore', () => translateWindow.show())

  // Always on top
  translateWindow.setAlwaysOnTop(true, 'floating', 2)
  screenWindow.setAlwaysOnTop(true, 'floating', 1)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// All other invoke functions
ipcMain.handle('getCaptureWindow', async (event, arg) => {
  if (!screenWindow) return;

  console.log('Screenshot signal received')
  // Remove :1 in any cases because if it have :1 the rendered picture will be black only. idk why lul.
  // Should add some preview or debug mode to see the preview of the rendered picture
  let w = screenWindow.getMediaSourceId().split(':')
  w.pop()
  w.push('0')

  return {
    id: w.join(':'),
    bounds: screenWindow.getBounds() // get the size of the capture window
  }
})

ipcMain.handle('imageToText', async (event, arg) => {
  if(!screenWindow) return;
  console.time('Total')
  console.time('Image to text')
  const evaluation = await easyOCR(arg.img)
  const text = evaluation.results.map(t => {return t.text}).join('')
  console.timeEnd('Image to text')
  console.time('Translate')
  const [translatedText, furigana] = await Promise.all([
    await deepLTranslate(text).catch(err => { return false }),
    await kanjiToFuri(text).then(res => {return res})
  ])
  console.timeEnd('Translate')
  console.timeEnd('Total')
  return { status: 200, data: { 
      text, 
      translatedText: translatedText ? translatedText : false, 
      furigana: furigana,
      evaluation: evaluation
    } 
  }
})

ipcMain.on('minimize', () => {
  translateWindow.minimize()
  screenWindow.minimize()
})

// All other invoke functions
// ipcMain.handle('screenshot', async (event, arg) => {
//   if (!screenWindow) return;
//   console.log('Screenshot signal received')
//   // Retrieve the image and convert it to text
//   const text = await easyOCR('https://cdn.discordapp.com/attachments/899577298364280844/1088034319324422214/text.png') //change this once the screenshot function is done
//   console.log('Retrieved text: ' + text)
//   const [hiragana, translatedText] = await Promise.all([
//     await kanjiToHiragana(text).catch(err => { return false }),
//     await deepLTranslate(text).catch(err => { return false })
//   ])
//   console.log('Translated: ' + translatedText)
//   console.log('Hiragana: ' + hiragana)
//   return { status: 200, data: { text, hiragana: hiragana ? hiragana : false, translatedText: translatedText ? translatedText : false } }
// })

ipcMain.on('openURL', (event, arg) => shell.openExternal(arg))
ipcMain.on('updateLanguage', (event, arg) => { config.translate = arg })
