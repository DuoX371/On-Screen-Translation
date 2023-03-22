const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  sendScreenshotSignal: () => ipcRenderer.invoke('screenshot'),
  minimizePage: () => ipcRenderer.send('minimize'),
  openLink: (url) => ipcRenderer.send('openURL', url),
})