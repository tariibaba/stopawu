const { app, BrowserWindow } = require('electron');
const electronRemote = require('@electron/remote/main');

electronRemote.initialize();

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  electronRemote.enable(mainWindow.webContents);

  if (app.isPackaged) mainWindow.loadFile('index.html');
  else mainWindow.loadURL('http://localhost:8080');

  if (app.isPackaged) mainWindow.setMenu(null);
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
