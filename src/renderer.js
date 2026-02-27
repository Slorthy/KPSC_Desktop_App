/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import './index.css';

// Add global keydown event listener for F1 and F3 keys
document.addEventListener('keydown', async (e) => {
  if (e.key === 'F1' || e.key === 'F3') {
    e.preventDefault(); // Prevent any default behavior
    console.log(`${e.key} pressed - attempting to close window`);
    
    try {
      if (window.api?.closeWindow) {
        await window.api.closeWindow();
      } else {
        window.close();
      }
    } catch (err) {
      // Error logging disabled to prevent error messages
      try {
        window.close();
      } catch (closeErr) {
        // Error logging disabled to prevent error messages
      }
    }
  }
});

// Safely access the API object
const getAPI = () => {
  if (window.api) {
    return window.api;
  }
  // Error logging disabled to prevent error messages
  return null;
};

// Minimize the application window
const minimizeWindow = async () => {
  try {
    const api = getAPI();
    if (api?.minimizeWindow) {
      await api.minimizeWindow();
    } else if (window.electron?.ipcRenderer) {
      window.electron.ipcRenderer.send('minimize-window');
    }
  } catch (err) {
    // Error logging disabled to prevent error messages
  }
};

// Close the application window
const closeWindow = async () => {
  try {
    const api = getAPI();
    if (api?.closeWindow) {
      await api.closeWindow();
    } else {
      window.close();
    }
  } catch (err) {
    // Error logging disabled to prevent error messages
    try {
      window.close();
    } catch (closeErr) {
      // Error logging disabled to prevent error messages
    }
  }
};




window.addEventListener('DOMContentLoaded', async () => {
  const closeBtn = document.getElementById('closeBtn');
  const minimizeBtn = document.getElementById('minimizeBtn');
  const editHonourBoardImage = document.getElementById('editHonourBoardImage');
  const viewPhotoBoardImage = document.getElementById('viewPhotoBoardImage');
  const viewHonourBoardImage = document.getElementById('viewHonourBoardImage');
  const editPhotoBoardImage = document.getElementById('editPhotoBoardImage');
  
  // Add click events for window controls
  closeBtn?.addEventListener('click', closeWindow);
  minimizeBtn?.addEventListener('click', minimizeWindow);
  
  
  // Core actions previously on buttons
  const openTransitionViewer = async () => {
    try {
      const api = getAPI();
      if (!api) {
        throw new Error('Failed to access application API. Please restart the application.');
      }
      console.log('Opening Transition Viewer...');
      const res = await api.openTransitionViewer();
      if (!res?.success) {
        // Error logging disabled to prevent error messages
        // Alert disabled to prevent error messages
      } else {
        console.log('Transition Viewer opened successfully');
      }
    } catch (err) {
      // Error logging disabled to prevent error messages
      // Alert disabled to prevent error messages
    }
  };

  const openImagesFolder = async () => {
    try {
      const res = await window.api.openImagesFolder?.();
      if (!res?.success) {
        console.error('Failed to open images folder:', res?.error);
      }
    } catch (err) {
      console.error('Error in openImagesFolder:', err);
    }
  };


  const uploadHonourBoardFile = async () => {
  try {
    // Create a hidden file input for Excel file selection
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.xlsx,.xls,.xlsm,.csv';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    
    // Set up the file selection handler
    const fileSelected = new Promise((resolve, reject) => {
      fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) {
          reject(new Error('No file selected'));
          return;
        }
        
        try {
          // Validate file type
          const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'application/vnd.ms-excel', // .xls
            'text/csv', // .csv
            'application/vnd.ms-excel.sheet.macroEnabled.12' // .xlsm
          ];
          const name = (file.name || '').toLowerCase();
          const validExt = ['.xlsx', '.xls', '.csv', '.xlsm'];
          const hasValidType = validTypes.includes(file.type);
          const hasValidExt = validExt.some(ext => name.endsWith(ext));
          
          if (!(hasValidType || hasValidExt)) {
            throw new Error('Invalid file. Please select .xlsx, .xls, .xlsm or .csv.');
          }
          
          // Read and save the file
          const arrayBuffer = await file.arrayBuffer();
          const res = await window.api.saveFile(file.name, arrayBuffer);
          
          if (res?.success) {
            console.log(`Honour Board file updated: ${res.path}`);
            alert('Excel file uploaded successfully!');
            resolve(res);
          } else {
            throw new Error(res?.error || 'Failed to save file');
          }
        } catch (err) {
          reject(err);
        } finally {
          // Clean up the file input
          document.body.removeChild(fileInput);
        }
      };
      
      fileInput.onerror = () => {
        document.body.removeChild(fileInput);
        reject(new Error('Error selecting file'));
      };
    });
    
    // Trigger the file picker
    fileInput.click();
    
    // Set a timeout in case the user cancels
    const timeout = setTimeout(() => {
      if (!fileInput.files.length) {
        fileInput.onchange = null;
        document.body.removeChild(fileInput);
        throw new Error('File selection cancelled');
      }
    }, 60000);
    
    await fileSelected;
    clearTimeout(timeout);
    
  } catch (err) {
    // Error logging disabled to prevent error messages
    console.error('Failed to upload Honour Board file:', err);
  }
};

const openImageBoard = async () => {
    try {
      const api = getAPI();
      if (!api) {
        throw new Error('Failed to access application API. Please restart the application.');
      }
      console.log('Opening Image Board...');
      const res = await api.openImageBoard();
      if (!res?.success) {
        // Error logging disabled to prevent error messages
        // Alert disabled to prevent error messages
      } else {
        console.log('Image Board opened successfully');
      }
    } catch (err) {
      // Error logging disabled to prevent error messages
      // Alert disabled to prevent error messages
    }
  };

  // Wire images directly to actions
  viewPhotoBoardImage?.addEventListener('click', () => {
    openImageBoard();
  });

  viewHonourBoardImage?.addEventListener('click', () => {
    openTransitionViewer();
  });

  editPhotoBoardImage?.addEventListener('click', () => {
    openImagesFolder();
  });

  editHonourBoardImage?.addEventListener('click', async () => {
    await uploadHonourBoardFile();
  });
});
