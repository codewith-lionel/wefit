const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('./is-dev');
const { initDatabase } = require('./database');
const authHandlers = require('./ipc/authHandlers');
const memberHandlers = require('./ipc/memberHandlers');
const trainerHandlers = require('./ipc/trainerHandlers');
const planHandlers = require('./ipc/planHandlers');
const paymentHandlers = require('./ipc/paymentHandlers');
const attendanceHandlers = require('./ipc/attendanceHandlers');
const reportHandlers = require('./ipc/reportHandlers');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    backgroundColor: '#1a1a2e',
    show: false
  });

  // Load React app
  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`;

  mainWindow.loadURL(startUrl);

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle
app.whenReady().then(async () => {
  // Initialize database
  await initDatabase();

  // Register IPC handlers
  authHandlers(ipcMain);
  memberHandlers(ipcMain);
  trainerHandlers(ipcMain);
  planHandlers(ipcMain);
  paymentHandlers(ipcMain);
  attendanceHandlers(ipcMain);
  reportHandlers(ipcMain);

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    event.preventDefault();
  });

  contents.setWindowOpenHandler(({ url }) => {
    return { action: 'deny' };
  });
});
