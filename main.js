const { app, BrowserWindow, screen, ipcMain, desktopCapturer, shell } = require('electron')
const path = require('path')

// Cache Screen size
const Store = require('electron-store')
const store = new Store()

// Auto update
const { autoUpdater } = require('electron-updater')
autoUpdater.checkForUpdatesAndNotify()

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
  const { width, height } = store.get('screenSize') || { width: 600, height: 150 }
  screenWindow = new BrowserWindow({
    width: width,
    height: height,
    transparent: true,
    frame: false,
    resizable: true,
    title: 'Text Capturer Window',
    webPreferences: {
      devTools: app.isPackaged ? false : true,
    }
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
      additionalArguments: [JSON.stringify(config)],
      devTools: app.isPackaged ? false : true,
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

  // On resize
  screenWindow.on('resized', () => {
    let size = screenWindow.getSize()
    store.set('screenSize', {width: size[0], height: size[1]})
  })
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
  const evaluation = await easyOCR(arg.img).then(res => {return res})
  let text;
  if(evaluation.serverI === 0) {
    const s2Res = evaluation.res.data[1].data
    text = s2Res ? s2Res.map(res => {return res[0]}).join(' ') : false;
    if(!text) return {status: 500, data: {error: 'No text detected'}}
  } else{
    text = evaluation.res.results.map(t => {return t.text}).join(' ')
  }

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

ipcMain.on('openURL', (event, arg) => shell.openExternal(arg))
ipcMain.on('updateLanguage', (event, arg) => { config.translate = arg })
