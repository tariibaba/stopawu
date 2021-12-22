const { app, BrowserWindow, ipcMain } = require('electron');
const electronRemote = require('@electron/remote/main');
const regedit = require('regedit');
const path = require('path');
const url = require('url');

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

  const indexHtmlUrl = url.pathToFileURL(
    path.resolve(__dirname, './index.html')
  ).href;
  mainWindow.loadURL(app.isPackaged ? indexHtmlUrl : 'http://localhost:8080');

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

const UPDATE_PATH =
  'HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate\\AU';
const VALUE_PATH = 'NoAutoUpdate';

ipcMain.on('enable-wu', (event) => {
  regedit.deleteValue(`${UPDATE_PATH}\\${VALUE_PATH}`, (err) => {
    const error = {};
    if (err) {
      error.code = err.code;
      console.error(`error code: ${err.code}`);
    }
    event.reply('enable-wu', error);
  });
});

ipcMain.on('disable-wu', (event) => {
  regedit.putValue(
    {
      [UPDATE_PATH]: {
        [VALUE_PATH]: {
          value: 1,
          type: 'REG_DWORD',
        },
      },
    },
    (err) => {
      const error = {};
      if (err) {
        error.code = err.code;
        console.error(`error code: ${err.code}`);
      }
      event.reply('disable-wu', error);
    }
  );
});
