const { app, BrowserWindow, screen, ipcMain, desktopCapturer  } = require('electron')
const path = require('path')
const fs = require('fs')

// Tesseract and Bing Translate API
const imageToText = require('./js/tesseract.js')
const kanjiToHiragana = require('./js/kToH.js')
const translate = require('./js/sugoi-translator.js')
const deepLTranslate = require('./js/deepL.js')


let screenWindow = null, translateWindow = null
async function createWindow () {
  screenWindow = new BrowserWindow({
    width: 600,
    height: 150,
    transparent: true,
    frame: false,
    resizable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload/main.js')
    }
  })
  screenWindow.loadFile('pages/index.html')
}

async function createTranslatePage(){
  translateWindow = new BrowserWindow({
    width: 600,
    height: 350,
    transparent: true,
    frame: false,
    resizable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload/translate.js')
    }
  })

  translateWindow.loadFile('pages/translate.html')
}

app.on('ready', async () => {
  await createWindow()
  await createTranslatePage()
  // Close the app when any of the windows are closed
  screenWindow.on('closed', () => app.quit())
  translateWindow.on('closed', () => app.quit())
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.on('minimize', () => {
  translateWindow.minimize()
  screenWindow.minimize()
})

// All other invoke functions
ipcMain.handle('screenshot', async (event, arg) => {
  if(!screenWindow) return;
  console.log('Screenshot signal received')
  // Retrieve the image and convert it to text
  const text = await imageToText('https://cdn.discordapp.com/attachments/899577298364280844/1088034319324422214/text.png') //change this once the screenshot function is done
  console.log('Retrieved text: ' + text)
  const [hiragana, translatedText] = await Promise.all([
    await kanjiToHiragana(text).catch(err => {return false}),
    await deepLTranslate(text).catch(err => {return false})
  ])
  console.log('Translated: ' + translatedText)
  console.log('Hiragana: ' + hiragana)
  return {status: 200, data: {text, hiragana: hiragana ? hiragana : false, translatedText: translatedText ? translatedText : false}}
})