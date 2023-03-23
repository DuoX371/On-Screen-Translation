const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  test: () => ipcRenderer.send('test'),
})

ipcRenderer.on('screenshot', async (event, arg) => {
  console.log('Screenshot signal received preload side')
  document.dispatchEvent(new CustomEvent('screenshot', { detail: 'screenshot' }));
})