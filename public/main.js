const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron');
const electronRemote = require('@electron/remote/main');
const regedit = require('regedit');
const regeditPromisified = require('regedit').promises;
const path = require('path');
const url = require('url');
const sudo = require('sudo-prompt');
const {
  startServiceStopInterval,
  endServiceStopInterval,
} = require('./stop-wu-services');
const Store = require('electron-store');

electronRemote.initialize();

let tray = null;
const iconPath = path.join(__dirname, 'app-icon.png');

let mainWindow = null;
let isSystemClose = false;

const store = new Store({ name: 'userdata' });

function createWindow() {
  mainWindow = new BrowserWindow({
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

function createTray() {
  tray = new Tray(iconPath);
  tray.setToolTip('Stopawu');
  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show', click: () => mainWindow.show() },
    { label: 'Hide', click: () => mainWindow.hide() },
    {
      label: 'Quit',
      click: () => {
        isSystemClose = true;
        app.quit();
      },
    },
  ]);
  tray.setContextMenu(contextMenu);
  mainWindow.on('close', (event) => {
    if (isSystemClose) return;
    event.preventDefault();
    mainWindow.hide();
  });
}

app.whenReady().then(() => {
  createWindow();
  createTray();

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

const vbsDir = path.join(
  path.dirname(app.getPath('exe')),
  'resources/regedit/vbs'
);
regedit.setExternalVBSLocation(vbsDir);

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

ipcMain.on('is-wu-enabled', (event) => {
  regedit.list(UPDATE_PATH, (err, result) => {
    const error = {};
    if (err) {
      error.code = err.code;
      console.error(`error code: ${err.code}`);
      event.reply('is-wu-enabled', { status, error });
      return;
    }
    console.log(JSON.stringify(result, null));
    const status = result[UPDATE_PATH].values[VALUE_PATH]?.value !== 1;
    event.reply('is-wu-enabled', { status, error });
  });
});

ipcMain.on('save-data', (event, data) => {
  store.set(data);
  console.log('saved data successfully');
  event.reply('did-save-data');
});

ipcMain.on('load-data', (event) => {
  const data = store.store ?? {};
  if (data.isPreventingUpdateServices) {
    startServiceStopInterval();
  } else {
    endServiceStopInterval();
  }
  event.reply('did-load-data', data);
});

ipcMain.on('disable-wu', (event) => {
  regedit.createKey(UPDATE_PATH, (err) => {
    const error = {};
    if (err) {
      error.code = err.code;
      console.error(`error code: ${err.code}, ${err.message}`);
      event.reply('disable-wu', { error });
      return;
    }

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
          console.error(`error code: ${err.code}, ${err.message}`);
        }
        event.reply('disable-wu', error);
      }
    );
  });
});

ipcMain.on('prevent-update-services', (event) => {
  startServiceStopInterval();
  store.set({ isPreventingUpdateServices: true });
  event.reply('prevent-update-services');
});

ipcMain.on('allow-update-services', (event) => {
  endServiceStopInterval();
  store.set({ isPreventingUpdateServices: false });
  event.reply('allow-update-services');
});
