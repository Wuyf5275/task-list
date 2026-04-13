import { app, BrowserWindow } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
process.env.APP_ROOT = path.join(__dirname, '..')

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT!, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT!, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT!, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    title: '今日事今日毕',
    icon: path.join(process.env.APP_ROOT!, 'build', 'icon.png'),
    width: 340,
    height: 560,
    frame: false,
    transparent: true,
    skipTaskbar: false, // Let's not hide taskbar for now so they can find it
    resizable: false,
    alwaysOnTop: true,
    hasShadow: false, // Let CSS handle the shadow
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  // Set the window to be visible on all workspaces (macOS)
  if (process.platform === 'darwin') {
    win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
  } else if (process.platform === 'win32') {
    // Basic bottom-level logic for Windows (Disabled to allow it to float on top)
    // win.setAlwaysOnTop(false)
  }

  // Prevent window from getting accidentally closed via typical shortcuts if we want it widget-like
  // win.on('close', (event) => {})

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)
