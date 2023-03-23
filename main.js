const { app, BrowserWindow, screen, ipcMain, desktopCapturer } = require('electron')
const path = require('path')
const fs = require('fs')
const screenshot = require('screenshot-desktop')
const tesseract = require('tesseract.js')
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const ocrServer = ['https://tomofi-easyocr.hf.space/api/predict/', 'https://api.yewonkim.tk/ocr/']

let screenWindow = null, translateWindow = null
function createWindow() {
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

function createTranslatePage() {
  translateWindow = new BrowserWindow({
    width: 400,
    height: 250,
    transparent: false,
    frame: true,
    title: 'OST Main Window',
    webPreferences: {
      preload: path.join(__dirname, 'preload/translate.js')
    }
  })

  translateWindow.loadFile('pages/translate.html')
}

app.on('ready', () => {
  createWindow()
  createTranslatePage()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// All other invoke functions
ipcMain.handle('screenshot', async (event, arg) => {
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

function temp() {
  // Take a screenshot of screenWindow
  // const img = (await screenWindow.webContents.capturePage()).toPNG()
  // console.log(img)
  // const img = await screenshot({format: 'png'})
  // let def = 0; // Default display
  // const displayList = await screenshot.listDisplays()
  // console.log(displayList)
  // const img = await screenshot({screen: displayList[def].id, format: 'png'})
  // fs.writeFileSync('screenshot.png', img)

  // Screenshot a particular window
  screenWindow.webContents.capturePage().then((img) => {
    screenWindow.webContents.executeJavaScript(`document.createElement('canvas')`)
    // const canvas = document.createElement('canvas')
  })


  // fs.writeFileSync('screenshot.png', img)
  // const imgData = img.toDataURL()
  // console.log(imgData)
  //screenWindow.webContents.send('screenshot', 'screenshot')
}

async function imageToText(img, lang = 'jpn') {
  const text = await tesseract.recognize(img, lang).catch(err => console.log(err))
  return text.data.text;
}
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