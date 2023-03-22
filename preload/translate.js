const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  sendScreenshotSignal: () => ipcRenderer.invoke('screenshot'),
  minimizePage: () => ipcRenderer.send('minimize'),
  openLink: (url) => ipcRenderer.send('openURL', url),
  updateLanguage: (lang) => ipcRenderer.send('updateLanguage', lang),
})

contextBridge.exposeInMainWorld('config', JSON.parse(process.argv[process.argv.length - 1]))

ipcRenderer.on('config', (event, arg) => {
  document.dispatchEvent(new CustomEvent('config', { detail: arg }))
})