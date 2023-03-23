const { app, BrowserWindow, screen, ipcMain, desktopCapturer, shell } = require('electron')
const path = require('path')
const fs = require('fs')
const fetch = require('node-fetch')

// Tesseract and Bing Translate API
const imageToText = require('./js/tesseract.js')
const kanjiToHiragana = require('./js/kToH.js')
const translate = require('./js/sugoi-translator.js')
const deepLTranslate = require('./js/deepL.js')

// Load the config file
const config = require('./config.js')

const ocrServer = ['https://tomofi-easyocr.hf.space/api/predict/', 'https://api.yewonkim.tk/ocr/']

let screenWindow = null, translateWindow = null
async function createWindow() {
  screenWindow = new BrowserWindow({
    width: 600,
    height: 150,
    transparent: true,
    frame: false,
    resizable: true,
    title: 'Text Capturer Window',
    webPreferences: {
      preload: path.join(__dirname, 'preload/main.js')
    }
  })
  screenWindow.loadFile('pages/index.html')
}

async function createTranslatePage() {
  translateWindow = new BrowserWindow({
    width: 600,
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
  // translateWindow.webContents.send('config', config)
}

app.on('ready', async () => {
  await createTranslatePage()
  await createWindow()

  // Close the app when any of the windows are closed
  screenWindow.on('closed', () => app.quit())
  translateWindow.on('closed', () => app.quit())

  screenWindow.on('restore', () => translateWindow.show())

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
  return await (arg.lang ? easyOCR(arg.img, arg.lang) : easyOCR(arg.img))
})

async function easyOCR(img, lang = 'ja') {
  const server = ocrServer[Math.floor(Math.random() * ocrServer.length)]
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

ipcMain.on('minimize', () => {
  translateWindow.minimize()
  screenWindow.minimize()
})

// All other invoke functions
ipcMain.handle('screenshot', async (event, arg) => {
  if (!screenWindow) return;
  console.log('Screenshot signal received')
  // Retrieve the image and convert it to text
  const text = await imageToText('https://cdn.discordapp.com/attachments/899577298364280844/1088034319324422214/text.png') //change this once the screenshot function is done
  console.log('Retrieved text: ' + text)
  const [hiragana, translatedText] = await Promise.all([
    await kanjiToHiragana(text).catch(err => { return false }),
    await deepLTranslate(text).catch(err => { return false })
  ])
  console.log('Translated: ' + translatedText)
  console.log('Hiragana: ' + hiragana)
  return { status: 200, data: { text, hiragana: hiragana ? hiragana : false, translatedText: translatedText ? translatedText : false } }
})

ipcMain.on('openURL', (event, arg) => shell.openExternal(arg))
ipcMain.on('updateLanguage', (event, arg) => { config.translate = arg })
