const { ipcRenderer, contextBridge } = require('electron')

contextBridge.exposeInMainWorld('miniframe', {
  moveWindow: (x, y) => ipcRenderer.send('miniframe-move', { x, y }),
})
