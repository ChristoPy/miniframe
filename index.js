const { app, BrowserWindow, ipcMain } = require('electron')
const { resolve } = require('path')
const args = [...Array.from(process.argv).slice(2)]

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 340,
    height: 600,
    frame: false,
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: -100, y: -100 },
    webPreferences: {
      preload: resolve(app.getAppPath(), 'preload.js'),
    }
  })

  const url = args[0]
  const hasProtocol = url.startsWith('http://') || url.startsWith('https://')

  mainWindow.loadURL(hasProtocol ? url : `https://${url}`)

  mainWindow.webContents.on('dom-ready', () => {
    mainWindow.webContents.executeJavaScript(`;(() => {
      const wrapper = document.createElement("div")
      const drag = document.createElement("div")

      wrapper.id = "miniframe-wrapper"
      drag.id = "miniframe-drag"

      const wrapperStyle = document.createElement("style")
      wrapperStyle.innerHTML = "::-webkit-scrollbar{display:none;}#miniframe-wrapper{position:fixed;bottom:0em;padding-bottom:1em;left:0;right:0;z-index:99999999;}#miniframe-drag{border-radius:1em;cursor:grabbing;background:#fff;margin:0 auto;width:5em;height:2em;transform:translateY(200%);transition:.3s ease;}#miniframe-wrapper:hover > #miniframe-drag{transform: translateY(0%);}"

      wrapper.appendChild(drag)
      document.body.appendChild(wrapper)
      document.body.appendChild(wrapperStyle)

      let dragging = false
      let startX = 0
      let startY = 0
      let canUpdate = true

      const supressEvent = (event) => {
        event.preventDefault()
        event.stopPropagation()
      }

      drag.addEventListener('mousedown', (event) => {
        dragging = true
        startX = event.pageX
        startY = event.pageY
        supressEvent(event)
      })
      document.addEventListener('mouseup', (event) => {
        dragging = false
        supressEvent(event)
        window.miniframe.setPosition()
      })
      document.addEventListener('mousemove', (event) => {
        if (!dragging || !canUpdate) return

        canUpdate = false
        supressEvent(event)
        window.miniframe.moveWindow(event.screenX - 36, event.screenY - 36)
        setTimeout(() => canUpdate = true, 8)
      })
    })()`)
  })

  mainWindow.setAlwaysOnTop(true, 'floating')

  ipcMain.on('miniframe-move', (event, data) => {
    mainWindow.setPosition(data.x - 340 / 2 + 40, data.y - 580 + 40)
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
