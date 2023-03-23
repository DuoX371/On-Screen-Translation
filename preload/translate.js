const { contextBridge, ipcRenderer } = require('electron');


contextBridge.exposeInMainWorld('electron', {
  sendScreenshotSignal: () => ipcRenderer.invoke('screenshot'),
  sendImageToText: (arg) => ipcRenderer.invoke('imageToText', arg)
})