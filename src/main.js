import { app, BrowserWindow, ipcMain, screen, powerSaveBlocker, shell, protocol, net } from 'electron';

import path from 'node:path';

import { pathToFileURL } from 'node:url';

import fs from 'node:fs/promises';

import started from 'electron-squirrel-startup';



// --- 1. CONFIGURATION & PATHS ---

const desktopPath = app.getPath('desktop');

const kpscFolder = path.join(desktopPath, 'KPSC_DATA'); 

const excelPath = path.join(kpscFolder, 'data.xlsx');

const photosPath = path.join(kpscFolder, 'Club_Photos');



let pendingImageData = null; 



async function ensureFolders() {

  try {

    await fs.mkdir(kpscFolder, { recursive: true });

    await fs.mkdir(photosPath, { recursive: true });

    const subfolders = ['Baseball', 'Cricket', 'Football', 'Netball', 'Softball', 'Random_Photos_All_Sports'];

    for (const subfolder of subfolders) {

      await fs.mkdir(path.join(photosPath, subfolder), { recursive: true });

    }

  } catch (err) { console.error("Folder error:", err); }

}



let mainWindow = null;

if (started) { app.quit(); }



const createWindow = () => {

  mainWindow = new BrowserWindow({

    width: 750, height: 620,

    title: 'KPSC Desktop Display App',

    resizable: false, frame: false, center: true,

    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, sandbox: false },

  });



  if (typeof MAIN_WINDOW_VITE_DEV_SERVER_URL !== 'undefined' && MAIN_WINDOW_VITE_DEV_SERVER_URL) {

    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);

  } else {

    mainWindow.loadFile(path.join(__dirname, '../renderer/main_window/index.html'));

  }

};



app.whenReady().then(() => {

  protocol.handle('local-data', (request) => {

    const rawPath = request.url.replace('local-data://', '');

    const decodedPath = decodeURIComponent(rawPath);

    return net.fetch(pathToFileURL(decodedPath).toString());

  });

  ensureFolders();

  createWindow();

});



// --- 2. EXCEL & DATA HANDLERS ---

async function readExcelFile() {

  try {

    const buf = await fs.readFile(excelPath);

    return { success: true, path: excelPath, data: buf.toString('base64') };

  } catch (err) { return { success: false, error: "Excel not found" }; }

}



ipcMain.handle('save-file', async (e, { buffer }) => {

  try { await ensureFolders(); await fs.writeFile(excelPath, Buffer.from(buffer)); return { success: true }; }

  catch (err) { return { success: false, error: err.message }; }

});



ipcMain.handle('read-stored-file', () => readExcelFile());

ipcMain.handle('read-stored-file-viewer2', () => readExcelFile());

ipcMain.handle('read-stored-file-viewer3', () => readExcelFile());

ipcMain.handle('get-stored-file-path', async () => {

  try { await fs.access(excelPath); return { exists: true, path: excelPath }; }

  catch { return { exists: false }; }

});



// --- 3. THE "TRUE RANDOM" HANDLER ---

ipcMain.handle('get-images-from-folder', async (e, sport) => {

  try {

    let masterList = [];

    const validExts = ['.jpg', '.jpeg', '.png', '.webp'];



    // Helper: Scrambles any list of items
    const shuffleArray = (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    };

    // Helper: Sort array alphabetically by filename
    const sortAlphabetically = (array) => {
      return array.sort((a, b) => {
        const filenameA = a.split('/').pop().toLowerCase();
        const filenameB = b.split('/').pop().toLowerCase();
        return filenameA.localeCompare(filenameB);
      });
    };



    // Helper: Recursive crawl to find EVERY image in EVERY subfolder

    const findImagesRecursively = async (directory) => {

      const items = await fs.readdir(directory, { withFileTypes: true });

      for (const item of items) {

        const res = path.resolve(directory, item.name);

        if (item.isDirectory()) {

          await findImagesRecursively(res);

        } else if (validExts.includes(path.extname(item.name).toLowerCase())) {

          masterList.push(`local-data://${encodeURIComponent(res)}`);

        }

      }

    };



    if (sport === 'Random_Photos_All_Sports' || !sport) {

      // Step 1: Dig through every folder (Cricket, Football, etc.) and put all paths in one bucket

      await findImagesRecursively(photosPath);

      // Step 2: Shuffle that massive bucket so sport order is destroyed
      masterList = shuffleArray(masterList);

    } else {

      // Specific sport logic (still sorted alphabetically)

      const targetPath = path.join(photosPath, sport);

      const files = await fs.readdir(targetPath);

      files.forEach(f => {

        if (validExts.includes(path.extname(f).toLowerCase())) {

          masterList.push(`local-data://${encodeURIComponent(path.join(targetPath, f))}`);

        }

      });

      masterList = sortAlphabetically(masterList);

    }



    return { success: true, images: masterList };

  } catch (err) {

    console.error("Shuffle System Error:", err);

    return { success: false, images: [] };

  }

});



ipcMain.handle('open-images-folder', async () => { shell.openPath(photosPath); return { success: true }; });



ipcMain.handle('open-image-board', async () => {

  if (mainWindow) mainWindow.hide();

  const boardWin = new BrowserWindow({

    width: 750, height: 620, frame: false, center: true,

    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, sandbox: false }

  });

  boardWin.on('closed', () => { if (mainWindow) { mainWindow.show(); mainWindow.focus(); } });

  

  if (typeof MAIN_WINDOW_VITE_DEV_SERVER_URL !== 'undefined') {

    await boardWin.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}/src/renderer/main_window/Image_Board.html`);

  } else {

    await boardWin.loadFile(path.join(__dirname, '../renderer/main_window/Image_Board.html'));

  }

});



// --- 4. WINDOW MANAGEMENT ---

ipcMain.handle('minimize-window', (e) => { BrowserWindow.fromWebContents(e.sender)?.minimize(); });

ipcMain.handle('close-window', (e) => { BrowserWindow.fromWebContents(e.sender)?.close(); });



app.on('browser-window-focus', () => {

  const { globalShortcut } = require('electron');

  globalShortcut.unregisterAll();

  globalShortcut.register('F2', () => {
    app.quit();
  });

  globalShortcut.register('Backspace', () => {

    BrowserWindow.getAllWindows().forEach(w => { if (w !== mainWindow) w.close(); });

    if (mainWindow) { mainWindow.show(); mainWindow.focus(); }

  });

});

// ... (rest of the code remains the same)
ipcMain.handle('open-viewer-window', () => openBoardViewer('index.html'));

ipcMain.handle('open-transition-viewer-window', () => openBoardViewer('Honour_Board_Transition_Viewer.html'));


// Track which displays are already in use
let usedDisplays = new Set();

// Track open viewers to manage taskbar visibility
let openViewers = new Set();

// Function to update taskbar visibility based on open viewers
function updateTaskbarVisibility() {
  const shouldHide = openViewers.size > 0;
  
  // Hide/show menu bar for all windows
  BrowserWindow.getAllWindows().forEach(win => {
    win.setAutoHideMenuBar(shouldHide);
    if (shouldHide) {
      win.setMenuBarVisibility(false);
    }
  });
}

async function openBoardViewer(fileName, targetDisplay = null) {
  
  // If no specific display provided, detect available displays and choose appropriately
  if (!targetDisplay) {
    const displays = screen.getAllDisplays();
    const primaryDisplay = screen.getPrimaryDisplay();
    
    if (displays.length > 1) {
      // Multiple displays found - choose secondary for first window, primary for second window
      const secondaryDisplay = displays.find(d => d.id !== primaryDisplay.id);
      
      if (!usedDisplays.has(secondaryDisplay.id)) {
        // Secondary display is available - use it for this window
        targetDisplay = secondaryDisplay;
        usedDisplays.add(secondaryDisplay.id);
      } else if (!usedDisplays.has(primaryDisplay.id)) {
        // Secondary is taken, use primary display
        targetDisplay = primaryDisplay;
        usedDisplays.add(primaryDisplay.id);
      } else {
        // Both displays are in use, reset and use secondary
        usedDisplays.clear();
        targetDisplay = secondaryDisplay;
        usedDisplays.add(secondaryDisplay.id);
      }
    } else {
      // Only one display available
      targetDisplay = primaryDisplay;
    }
  }

  const win = new BrowserWindow({ 
    ...targetDisplay.bounds, 
    frame: false, 
    kiosk: true, 
    alwaysOnTop: true,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, sandbox: false }
  });

  // Track this viewer
  const viewerId = `board-${Date.now()}`;
  openViewers.add(viewerId);
  updateTaskbarVisibility();

  // Clear used displays and viewer tracking when window is closed
  win.on('closed', () => {
    usedDisplays.delete(targetDisplay.id);
    openViewers.delete(viewerId);
    updateTaskbarVisibility();
  });

  if (typeof MAIN_WINDOW_VITE_DEV_SERVER_URL !== 'undefined') {
    await win.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}/src/renderer/main_window/${fileName}`);
  } else {
    await win.loadFile(path.join(__dirname, `../renderer/main_window/${fileName}`));
  }
}



// --- 5. FULLSCREEN VIEWER HANDLERS ---

ipcMain.handle('open-fullscreen-image-viewer', async (event, images, startIndex = 0) => {

  pendingImageData = { images, startIndex };

  // Use the same display detection logic as honour board viewers
  const displays = screen.getAllDisplays();
  const primaryDisplay = screen.getPrimaryDisplay();
  let targetDisplay = primaryDisplay;

  if (displays.length > 1) {
    // Multiple displays found - try to use secondary display first
    const secondaryDisplay = displays.find(d => d.id !== primaryDisplay.id);
    
    if (!usedDisplays.has(secondaryDisplay.id)) {
      // Secondary display is available - use it for this window
      targetDisplay = secondaryDisplay;
      usedDisplays.add(secondaryDisplay.id);
    } else if (!usedDisplays.has(primaryDisplay.id)) {
      // Secondary is taken, use primary display
      targetDisplay = primaryDisplay;
      usedDisplays.add(primaryDisplay.id);
    } else {
      // Both displays are in use, reset and use secondary
      usedDisplays.clear();
      targetDisplay = secondaryDisplay;
      usedDisplays.add(secondaryDisplay.id);
    }
  }

  const win = new BrowserWindow({

    ...targetDisplay.bounds, frame: false, kiosk: true, alwaysOnTop: true,

    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, sandbox: false }

  });

  // Track this viewer
  const viewerId = `fullscreen-${Date.now()}`;
  openViewers.add(viewerId);
  updateTaskbarVisibility();

  // Clear used displays and viewer tracking when window is closed
  win.on('closed', () => {
    usedDisplays.delete(targetDisplay.id);
    openViewers.delete(viewerId);
    updateTaskbarVisibility();
  });

  const page = 'Fullscreen_Image_Viewer.html';

  if (typeof MAIN_WINDOW_VITE_DEV_SERVER_URL !== 'undefined') {

    await win.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}/src/renderer/main_window/${page}`);

  } else {

    await win.loadFile(path.join(__dirname, `../renderer/main_window/${page}`));

  }

  return { success: true };

});

ipcMain.handle('get-fullscreen-data', () => pendingImageData);