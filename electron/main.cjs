const { app, BrowserWindow, Menu, session, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');

// Force development mode when running with electron:dev
const isDev = process.env.npm_lifecycle_event === 'electron:dev';

let mainWindow;

// Function to check if a port is available
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = http.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
}

// Function to find an available port
async function findAvailablePort(startPort) {
  let port = startPort;
  while (!(await isPortAvailable(port))) {
    port++;
  }
  return port;
}

async function createWindow() {
  console.log('Creating main window...');
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    icon: path.join(__dirname, '../public/images/logo.png'),
    webPreferences: {
      nodeIntegration: false, // Recommended for security
      contextIsolation: true, // Enable contextIsolation for security
      webSecurity: false,
      allowRunningInsecureContent: true,
      preload: path.join(__dirname, 'preload.cjs')
    },
  });
  
  console.log('Setting up IPC handlers...');
  console.log('Preload path:', path.join(__dirname, 'preload.cjs'));
  console.log('Development mode:', isDev);

  // Load the app URL
  if (isDev) {
    // Find the first available port starting from 5173
    const port = await findAvailablePort(5173);
    const appUrl = `http://localhost:${port}`;
    console.log('Loading development URL:', appUrl);
    
    // Wait for the dev server to be ready
    const waitForServer = async () => {
      try {
        const response = await fetch(appUrl);
        if (response.ok) {
          mainWindow.loadURL(appUrl);
          mainWindow.webContents.openDevTools();
        } else {
          setTimeout(waitForServer, 1000);
        }
      } catch (error) {
        setTimeout(waitForServer, 1000);
      }
    };
    
    waitForServer();
  } else {
    const appUrl = `file://${path.join(__dirname, '../dist/index.html')}`;
    console.log('Loading production URL:', appUrl);
    mainWindow.loadURL(appUrl);
  }

  // Handle PDF save events from renderer
  ipcMain.handle('save-pdf', async (event, { pdfBase64, defaultFileName }) => {
    console.log(`main.js: Received save-pdf request for ${defaultFileName}`);
    console.log(`main.js: Base64 data length: ${pdfBase64 ? pdfBase64.length : 0}`);
    
    try {
      // Get the Downloads folder for Mac
      const downloadsPath = app.getPath('downloads');
      console.log('Downloads path:', downloadsPath);
      
      console.log('main.js: Opening save dialog...');
      const dialogResult = await dialog.showSaveDialog({
        title: 'Save PDF Report',
        defaultPath: path.join(downloadsPath, defaultFileName || 'report.pdf'),
        filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
        properties: ['createDirectory', 'showOverwriteConfirmation']
      });
      
      console.log('main.js: Save dialog result:', dialogResult);
      
      if (dialogResult.canceled) {
        console.log('main.js: Save dialog was canceled');
        return { success: false, error: 'User cancelled the save dialog' };
      }
      
      const filePath = dialogResult.filePath;
      
      if (!filePath) {
        console.log('main.js: No file path was selected');
        return { success: false, error: 'No file path selected' };
      }
      
      try {
        console.log(`main.js: Converting base64 to buffer (${pdfBase64.length} bytes)...`);
        const pdfBuffer = Buffer.from(pdfBase64, 'base64');
        console.log(`main.js: Buffer created (${pdfBuffer.length} bytes)`);
        
        // Check directory access and create directory if needed (for macOS)
        const directory = path.dirname(filePath);
        console.log(`main.js: Checking directory: ${directory}`);
        
        try {
          // Check if directory exists
          if (!fs.existsSync(directory)) {
            console.log(`main.js: Creating directory: ${directory}`);
            fs.mkdirSync(directory, { recursive: true });
          }
        } catch (dirError) {
          console.error(`main.js: Error with directory: ${dirError}`);
        }
        
        console.log(`main.js: Writing file to ${filePath}...`);
        fs.writeFileSync(filePath, pdfBuffer);
        console.log('main.js: File successfully written');
        
        // On Mac, show the file in Finder
        if (process.platform === 'darwin') {
          try {
            shell.showItemInFolder(filePath);
          } catch (showError) {
            console.error('Error showing file in Finder:', showError);
          }
        }
        
        return { success: true, filePath };
      } catch (writeError) {
        console.error('main.js: Error writing file:', writeError);
        return { 
          success: false, 
          error: `Error writing file: ${writeError.message || 'Unknown error'}`
        };
      }
    } catch (error) {
      console.error('main.js: Error in save-pdf handler:', error);
      return { 
        success: false, 
        error: `Error saving PDF: ${error.message || 'Unknown error'}`
      };
    }
  });

  // Configure downloads
  session.defaultSession.on('will-download', (event, item, webContents) => {
    // Set the save path to the user's downloads directory
    const downloadsPath = app.getPath('downloads');
    const fileName = item.getFilename();
    const filePath = path.join(downloadsPath, fileName);
    item.setSavePath(filePath);

    item.on('updated', (event, state) => {
      if (state === 'interrupted') {
        console.log('Download is interrupted but can be resumed');
      } else if (state === 'progressing') {
        if (item.isPaused()) {
          console.log('Download is paused');
        } else {
          console.log(`Received bytes: ${item.getReceivedBytes()}`);
        }
      }
    });

    item.on('done', (event, state) => {
      if (state === 'completed') {
        console.log(`Download successfully saved to ${filePath}`);
        mainWindow.webContents.send('download-complete', { success: true, filePath });
      } else {
        console.log(`Download failed: ${state}`);
        mainWindow.webContents.send('download-complete', { success: false, error: state });
      }
    });
  });

  // Add Content Security Policy
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' 'unsafe-inline' data: blob:; " +
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
          "style-src 'self' 'unsafe-inline';" +
          "img-src 'self' data: blob:;" +
          "font-src 'self' data:;"
        ]
      }
    });
  });

  // Create the Application's main menu
  const template = [
    {
      label: 'Application',
      submenu: [
        { label: 'About', role: 'about' },
        { type: 'separator' },
        { label: 'Quit', accelerator: 'Command+Q', click: function() { app.quit(); }}
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
        { label: 'Select All', accelerator: 'CmdOrCtrl+A', role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { label: 'Toggle Developer Tools', accelerator: 'Alt+Command+I', click: function() { mainWindow.webContents.toggleDevTools(); }}
      ]
    }
  ];
  
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));

  // Handle window closed
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
}); 