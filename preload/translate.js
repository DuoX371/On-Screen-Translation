const { contextBridge, ipcRenderer } = require('electron');


contextBridge.exposeInMainWorld('electron', {
  sendScreenshotSignal: () => ipcRenderer.send('screenshot'),
})