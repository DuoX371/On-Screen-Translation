const { app, BrowserWindow, screen, ipcMain, desktopCapturer  } = require('electron')
const path = require('path')
const fs = require('fs')
const screenshot = require('screenshot-desktop')

let screenWindow = null, translateWindow = null
function createWindow () {
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

function createTranslatePage(){
  translateWindow = new BrowserWindow({
    width: 400,
    height: 250,
    transparent: false,
    frame: true,
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
ipcMain.on('screenshot', async (event, arg) => {
  if(!screenWindow) return;
  console.log('Screenshot signal received')

  
})


function temp(){
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