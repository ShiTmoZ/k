const { app, BrowserWindow } = require('electron');
const path = require('path');
const server = require('./server');

let win = null;
const PORT = process.env.PORT || 3000;

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 980,
    minHeight: 700,
    backgroundColor: '#030508',
    title: 'NEUROSHIFT — Neural Integrity Console',
    autoHideMenuBar: true,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  win.loadURL(`http://localhost:${PORT}`);

  win.on('closed', () => {
    win = null;
  });
}

app.whenReady().then(() => {
  server.listen(PORT, '127.0.0.1', () => {
    console.log(`[Electron] Internal server running at http://127.0.0.1:${PORT}`);
    createWindow();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
