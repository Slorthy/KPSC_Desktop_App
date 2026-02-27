// Add debugging at the very top to see if script loads at all
import { read, utils } from 'xlsx';

// Global variables for transition viewer
let currentMode = 'viewer1'; // 'viewer1', 'video', 'viewer2', 'viewer3'
let scrollInterval = null;
let viewer1Data = null;
let viewer2Data = null;
let viewer3Data = null;
let isTransitioning = false;

// Buffer variables for scroll control
let board1Buffer = 35;
let board2Buffer = 15;
let board3Buffer = 15;

// Board delay settings
let board1StartDelay = 2;
let board2StartDelay = 2;
let board3StartDelay = 2;
let board1EndDelay = 2;
let board2EndDelay = 2;
let board3EndDelay = 2;

// Add debugging for scroll position
let lastScrollPosition = 0;
let scrollCheckCount = 0;

async function loadBothExcelFiles() {
  const message = document.getElementById('message');
  const container = document.getElementById('tableContainer');

  try {
    // First check if the Excel file exists
    const fileCheck = await window.api.getStoredPath();
    if (!fileCheck || !fileCheck.exists) {
      if (message) {
        message.textContent = 'No Excel file found. Please upload an Excel file using the "Edit Honour Board" button in the main app.';
        message.style.display = 'block';
      }
      if (container) container.style.display = 'none';
      return;
    }

    // Load Viewer 1 data
    const res1 = await window.api.readStoredFile();
    if (!res1 || !res1.success) throw new Error(res1?.error || 'Failed to read Viewer 1 file');

    const binary1 = atob(res1.data);
    const bytes1 = new Uint8Array(binary1.length);
    for (let i = 0; i < binary1.length; i++) bytes1[i] = binary1.charCodeAt(i);

    const workbook1 = read(bytes1.buffer, { type: 'array' });
    
    // Read from "Board1" sheet instead of first sheet
    const board1Sheet = workbook1.Sheets['Board1'];
    if (!board1Sheet) {
      throw new Error('Board1 sheet not found in Excel file');
    }
    
    const jsonData1 = utils.sheet_to_json(board1Sheet, { header: 1, defval: '' });
    viewer1Data = jsonData1.slice(1).map(row => row.slice(0, 4)); // Columns A-D from Board1 sheet

    // Load Viewer 2 data
    console.log('Loading Viewer 2 data...');
    const res2 = await window.api.readStoredFileForViewer2();
    console.log('Viewer 2 API response:', res2);
    
    if (!res2 || !res2.success) {
      console.error('Failed to read Viewer 2 file:', res2?.error || 'Unknown error');
      throw new Error(res2?.error || 'Failed to read Viewer 2 file');
    }

    const binary2 = atob(res2.data);
    const bytes2 = new Uint8Array(binary2.length);
    for (let i = 0; i < binary2.length; i++) bytes2[i] = binary2.charCodeAt(i);

    const workbook2 = read(bytes2.buffer, { type: 'array' });
    console.log('Available sheets:', workbook2.SheetNames);
    
    // Read from "Board2" sheet instead of first sheet
    const board2Sheet = workbook2.Sheets['Board2'];
    if (!board2Sheet) {
      console.error('Board2 sheet not found. Available sheets:', workbook2.SheetNames);
      throw new Error('Board2 sheet not found in Excel file');
    }
    
    const jsonData2 = utils.sheet_to_json(board2Sheet, { header: 1, defval: '' });
    viewer2Data = jsonData2.slice(1).map(row => row.slice(0, 5)); // Columns A-E from Board2 sheet
    
    console.log('Viewer 2 data loaded from Board2 sheet, raw rows:', jsonData2.length);
    console.log('Viewer 2 data loaded, filtered rows:', viewer2Data.length);
    console.log('Viewer 2 using columns A-E from Board2 sheet');
    console.log('Viewer 2 sample data:', viewer2Data.slice(0, 3));

    // Load Viewer 3 data
    console.log('Loading Viewer 3 data...');
    const res3 = await window.api.readStoredFileForViewer3();
    console.log('Viewer 3 API response:', res3);
    
    if (!res3 || !res3.success) {
      console.error('Failed to read Viewer 3 file:', res3?.error || 'Unknown error');
      throw new Error(res3?.error || 'Failed to read Viewer 3 file');
    }

    const binary3 = atob(res3.data);
    const bytes3 = new Uint8Array(binary3.length);
    for (let i = 0; i < binary3.length; i++) bytes3[i] = binary3.charCodeAt(i);

    const workbook3 = read(bytes3.buffer, { type: 'array' });
    console.log('Available sheets for Viewer 3:', workbook3.SheetNames);
    
    // Read from "Board3" sheet
    const board3Sheet = workbook3.Sheets['Board3'];
    if (!board3Sheet) {
      console.error('Board3 sheet not found. Available sheets:', workbook3.SheetNames);
      throw new Error('Board3 sheet not found in Excel file');
    }
    
    const jsonData3 = utils.sheet_to_json(board3Sheet, { header: 1, defval: '' });
    viewer3Data = jsonData3.slice(1).map(row => row.slice(0, 5)); // Columns A-E from Board3 sheet
    
    console.log('Viewer 3 data loaded from Board3 sheet, raw rows:', jsonData3.length);
    console.log('Viewer 3 data loaded, filtered rows:', viewer3Data.length);
    console.log('Viewer 3 using columns A-E from Board3 sheet');
    console.log('Viewer 3 sample data:', viewer3Data.slice(0, 3));

    // Start with Viewer 1
    await displayViewer1Content();
    
  } catch (err) {
    message.style.color = 'red';
    message.textContent = `Error: ${err.message}`;
    console.error('Error loading Excel files:', err);
  }
}

async function displayViewer1Content() {
  console.log('=== DISPLAY VIEWER 1 CONTENT ===');
  const message = document.getElementById('message');
  const container = document.getElementById('tableContainer');
  const mainFrame = document.getElementById('mainFrame');
  
  // Switch to Viewer 1 layout
  mainFrame.className = 'frame layout-viewer1';
  currentMode = 'viewer1';
  
  if (!viewer1Data || viewer1Data.length === 0) {
    message.textContent = 'No Viewer 1 data available';
    return;
  }

  // Count actual data rows
  const actualDataRows = viewer1Data.filter(row => row.some(cell => cell && cell.toString().trim() !== ''));
  const excelRowCount = actualDataRows.length;
  
  console.log('Viewer 1 data rows:', actualDataRows.length);
  
  const html = utils.sheet_to_html(utils.aoa_to_sheet(viewer1Data), { id: 'excel-table' });
  message.style.display = 'none';
  container.innerHTML = html;
  container.style.opacity = '1';

  const table = document.getElementById('excel-table');
  console.log('Table element found:', !!table);
  
  if (table) {
    console.log('Setting up Viewer 1 table and scroll');
    
    // Maintain Custom Titles & Fonts
    let tbody = table.tBodies[0] || table.appendChild(document.createElement('tbody'));
    let thead = table.tHead || table.insertBefore(document.createElement('thead'), tbody);
    thead.innerHTML = '';
    const titles = ['YEAR', 'PRESIDENT', 'SECRETARY', 'TREASURER'];
    const trHead = document.createElement('tr');
    titles.forEach(name => {
      const th = document.createElement('th');
      th.textContent = name;
      trHead.appendChild(th);
    });
    thead.appendChild(trHead);
    table.classList.add('has-thead');

    // Add Buffer - back to reasonable size
    const buffer = document.createElement('div');
    buffer.style.height = '150px'; 
    container.appendChild(buffer);

    // Grid Line & Font Sync
    const setHeaderVar = () => {
      const header = table.querySelector('thead tr:first-child');
      const h = header ? header.getBoundingClientRect().height : 0;
      container.style.setProperty('--header-h', `${h + 2}px`);
      container.style.setProperty('--grid-h', `${container.scrollHeight}px`);
      container.style.setProperty('--scroll-y', `${Math.round(container.scrollTop)}px`);
    };

    if (!container.querySelector('.grid-overlay')) {
      const grid = document.createElement('div');
      grid.className = 'grid-overlay';
      container.prepend(grid);
    }

    // Defer start until fonts are ready (keeps layout stable)
    const fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
    fontsReady.then(() => {
      setHeaderVar();
      // Wait for Board 1 start delay before starting scroll
      const startDelay = (board1StartDelay + 2.5) * 1000; // Add 2.5s base delay
      setTimeout(() => {
        console.log(`Starting initial Viewer 1 scroll after ${board1StartDelay + 2.5}-second pause at top`);
        startPreciseInfiniteScroll(container, table, excelRowCount);
      }, startDelay);
      // DISABLED: Start transition sequence after 10 seconds (interferes with infinite scroll test)
      // setTimeout(() => startTransitionSequence(), 10000);
    });

    window.addEventListener('resize', setHeaderVar);
  }
}

async function displayViewer2Content() {
  console.log('=== DISPLAY VIEWER 2 CONTENT ===');
  const message = document.getElementById('message');
  const container = document.getElementById('tableContainer');
  const mainFrame = document.getElementById('mainFrame');
  
  console.log('Current mainFrame className before change:', mainFrame.className);
  console.log('Viewer2Data available:', !!viewer2Data);
  console.log('Viewer2Data length:', viewer2Data ? viewer2Data.length : 'N/A');
  
  // Switch to Viewer 2 layout
  mainFrame.className = 'frame layout-viewer2';
  currentMode = 'viewer2';
  
  console.log('Changed mainFrame className to:', mainFrame.className);
  
  if (!viewer2Data || viewer2Data.length === 0) {
    console.log('No Viewer 2 data available, showing message');
    message.textContent = 'No Viewer 2 data available';
    message.style.display = 'block';
    return;
  }

  // Count actual data rows
  const actualDataRows = viewer2Data.filter(row => row.some(cell => cell && cell.toString().trim() !== ''));
  const excelRowCount = actualDataRows.length;
  
  console.log('Viewer 2 data rows:', actualDataRows.length);
  console.log('Sample Viewer 2 data:', viewer2Data.slice(0, 3));
  
  const html = utils.sheet_to_html(utils.aoa_to_sheet(viewer2Data), { id: 'excel-table' });
  console.log('Generated HTML length:', html.length);
  
  message.style.display = 'none';
  container.innerHTML = html;
  
  console.log('Container innerHTML set, checking table...');
  const table = document.getElementById('excel-table');
  console.log('Table element found:', !!table);
  
  if (table) {
    console.log('Setting up Viewer 2 table and scroll');
    
    // For Viewer 2, add proper headers
    let tbody = table.tBodies[0] || table.appendChild(document.createElement('tbody'));
    let thead = table.tHead || table.insertBefore(document.createElement('thead'), tbody);
    thead.innerHTML = '';
    const titles = ['', '', '20 YEAR MEMBER', '', ''];
    const trHead = document.createElement('tr');
    titles.forEach(name => {
      const th = document.createElement('th');
      th.textContent = name;
      trHead.appendChild(th);
    });
    thead.appendChild(trHead);
    table.classList.add('has-thead');
    
    // Add Buffer
    const buffer = document.createElement('div');
    buffer.style.height = '150px'; 
    container.appendChild(buffer);

    // Grid Line & Font Sync
    const setHeaderVar = () => {
      const header = table.querySelector('thead tr:first-child');
      const h = header ? header.getBoundingClientRect().height : 0;
      container.style.setProperty('--header-h', `${h + 2}px`);
      container.style.setProperty('--grid-h', `${container.scrollHeight}px`);
      container.style.setProperty('--scroll-y', `${Math.round(container.scrollTop)}px`);
    };

    if (!container.querySelector('.grid-overlay')) {
      const grid = document.createElement('div');
      grid.className = 'grid-overlay';
      container.prepend(grid);
    }

    // Fade in Viewer 2 content
    container.style.opacity = '0';
    setTimeout(() => {
      container.style.opacity = '1';
      console.log('Viewer 2 content faded in');
    }, 100);

    // Defer start until fonts are ready
    const fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
    fontsReady.then(() => {
      setHeaderVar();
      setTimeout(() => {
        console.log(`Waiting ${board2StartDelay} seconds before starting Viewer 2 scroll`);
        setTimeout(() => {
          console.log(`Starting Viewer 2 scroll after ${board2StartDelay}-second delay`);
          startPreciseInfiniteScroll(container, table, excelRowCount);
        }, board2StartDelay * 1000);
      }, 1000);
    });

    window.addEventListener('resize', setHeaderVar);
  } else {
    console.error('Failed to create table element');
  }
}

async function displayViewer3Content() {
  console.log('=== DISPLAY VIEWER 3 CONTENT ===');
  const message = document.getElementById('message');
  const container = document.getElementById('tableContainer');
  const mainFrame = document.getElementById('mainFrame');
  
  console.log('Current mainFrame className before change:', mainFrame.className);
  console.log('Viewer3Data available:', !!viewer3Data);
  console.log('Viewer3Data length:', viewer3Data ? viewer3Data.length : 'N/A');
  
  // Switch to Viewer 3 layout
  mainFrame.className = 'frame layout-viewer3';
  currentMode = 'viewer3';
  
  console.log('Changed mainFrame className to:', mainFrame.className);
  
  if (!viewer3Data || viewer3Data.length === 0) {
    console.log('No Viewer 3 data available, showing message');
    message.textContent = 'No Viewer 3 data available';
    message.style.display = 'block';
    return;
  }

  // Count actual data rows
  const actualDataRows = viewer3Data.filter(row => row.some(cell => cell && cell.toString().trim() !== ''));
  const excelRowCount = actualDataRows.length;
  
  console.log('Viewer 3 data rows:', actualDataRows.length);
  console.log('Sample Viewer 3 data:', viewer3Data.slice(0, 3));
  
  const html = utils.sheet_to_html(utils.aoa_to_sheet(viewer3Data), { id: 'excel-table' });
  console.log('Generated HTML length:', html.length);
  
  message.style.display = 'none';
  container.innerHTML = html;
  
  console.log('Container innerHTML set, checking table...');
  const table = document.getElementById('excel-table');
  console.log('Table element found:', !!table);
  
  if (table) {
    console.log('Setting up Viewer 3 table and scroll');
    
    // For Viewer 3, add proper headers (only 3 columns for proper centering)
    let tbody = table.tBodies[0] || table.appendChild(document.createElement('tbody'));
    let thead = table.tHead || table.insertBefore(document.createElement('thead'), tbody);
    thead.innerHTML = '';
    const titles = ['', 'Life Members', ''];
    const trHead = document.createElement('tr');
    titles.forEach(name => {
      const th = document.createElement('th');
      th.textContent = name;
      trHead.appendChild(th);
    });
    thead.appendChild(trHead);
    table.classList.add('has-thead');
    
    // Add Buffer
    const buffer = document.createElement('div');
    buffer.style.height = '150px'; 
    container.appendChild(buffer);

    // Grid Line & Font Sync
    const setHeaderVar = () => {
      const header = table.querySelector('thead tr:first-child');
      const h = header ? header.getBoundingClientRect().height : 0;
      container.style.setProperty('--header-h', `${h + 2}px`);
      container.style.setProperty('--grid-h', `${container.scrollHeight}px`);
      container.style.setProperty('--scroll-y', `${Math.round(container.scrollTop)}px`);
    };

    if (!container.querySelector('.grid-overlay')) {
      const grid = document.createElement('div');
      grid.className = 'grid-overlay';
      container.prepend(grid);
    }

    // Fade in Viewer 3 content
    container.style.opacity = '0';
    setTimeout(() => {
      container.style.opacity = '1';
      console.log('Viewer 3 content faded in');
    }, 100);

    // Defer start until fonts are ready
    const fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
    fontsReady.then(() => {
      setHeaderVar();
      setTimeout(() => {
        console.log(`Waiting ${board3StartDelay} seconds before starting Viewer 3 scroll`);
        setTimeout(() => {
          console.log(`Starting Viewer 3 scroll after ${board3StartDelay}-second delay`);
          startPreciseInfiniteScroll(container, table, excelRowCount);
        }, board3StartDelay * 1000);
      }, 1000);
    });

    window.addEventListener('resize', setHeaderVar);
  } else {
    console.error('Failed to create table element');
  }
}

function startPreciseInfiniteScroll(container, table, excelRowCount) {
  const rows = table.querySelectorAll('tbody tr');
  const lastRow = rows[rows.length - 1];
  const totalRows = rows.length;
  
  // Calculate scroll distance based on actual table height with mode-specific adjustments
  let targetScrollPosition = 0;
  if (excelRowCount > 0) {
    const tableHeight = table.offsetHeight;
    const containerHeight = container.clientHeight;
    
    if (currentMode === 'viewer1') {
      // For Board 1: Use buffer variable
      targetScrollPosition = Math.max(0, tableHeight - containerHeight + board1Buffer);
    } else if (currentMode === 'viewer2') {
      // For Board 2: More aggressive target to reach actual bottom
      targetScrollPosition = Math.max(0, tableHeight - containerHeight + board2Buffer + 20);
    } else if (currentMode === 'viewer3') {
      // For Board 3: More aggressive target to reach actual bottom
      targetScrollPosition = Math.max(0, tableHeight - containerHeight + board3Buffer + 20);
    }
  }
  
  let pos = 0;
  const speed = 0.5; // Adjusted speed for transition viewer
  let isPaused = false;

  function step() {
    if (isPaused || isTransitioning) return;
    
    pos += speed;
    container.scrollTop = pos;
    container.style.setProperty('--scroll-y', `${pos}px`);
    
    // Simple bottom detection
    if (pos >= targetScrollPosition) {
      isPaused = true;
      
      if (currentMode === 'viewer2') {
        setTimeout(() => startTransitionToViewer3(), board2EndDelay * 1000);
      } else if (currentMode === 'viewer3') {
        setTimeout(() => startTransitionBackToViewer1(), board3EndDelay * 1000);
      } else if (currentMode === 'viewer1') {
        setTimeout(() => startTransitionSequence(), board1EndDelay * 1000);
      }
      
      return;
    }

    requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

async function startTransitionToViewer3() {
  console.log('=== START TRANSITION TO VIEWER 3 ===');
  
  if (isTransitioning) {
    console.log('Transition already in progress, skipping');
    return;
  }
  
  isTransitioning = true;
  
  // Start video immediately - don't fade out content (keep it visible behind transparent video)
  console.log('Starting video transition with Viewer 2 content visible behind');
  startVideoTransitionToViewer3();
}

function startVideoTransitionToViewer3() {
  const timestamp = new Date().toISOString();
  const video = document.getElementById('transitionVideo');
  const tableContainer = document.getElementById('tableContainer');
  
  console.log(`[${timestamp}] === START VIDEO TRANSITION TO VIEWER 3 ===`);
  console.log(`[${timestamp}] Video element found:`, !!video);
  console.log(`[${timestamp}] Table container found:`, !!tableContainer);
  
  if (video) {
    console.log(`[${timestamp}] Video current src:`, video.src);
    console.log(`[${timestamp}] Video duration:`, video.duration);
    console.log(`[${timestamp}] Video current time:`, video.currentTime);
    console.log(`[${timestamp}] Video readyState:`, video.readyState);
    console.log(`[${timestamp}] Video networkState:`, video.networkState);
  }
  
  // Show video directly covering the screen with fade in
  video.style.display = 'block';
  video.style.position = 'fixed';
  video.style.top = '0';
  video.style.left = '0';
  video.style.width = '100vw';
  video.style.height = '100vh';
  video.style.objectFit = 'cover';
  video.style.zIndex = '1000';
  video.style.visibility = 'visible';
  video.style.opacity = '0'; // Start invisible for fade in effect
  
  // Keep table visible behind video
  tableContainer.style.opacity = '1';
  
  // Stop current scrolling
  if (scrollInterval) {
    cancelAnimationFrame(scrollInterval);
    scrollInterval = null;
  }
  
  currentMode = 'video';
  
  console.log('Starting video for transition to Viewer 3');
  
  // Start video directly and fade in
  video.play().then(() => {
    console.log('Video started successfully for transition to Viewer 3');
    // Fade in over 0.5s
    setTimeout(() => {
      video.style.opacity = '1'; // Fade to visible
    }, 50); // Small delay for smooth transition
  }).catch(error => {
    console.error('Failed to start video for transition to Viewer 3:', error);
  });
  
  // Handle video time update to switch content at 50% completion and manage filter
  function handleTimeUpdate() {
    const currentTime = video.currentTime;
    const duration = video.duration;
    
    
    if (duration && currentTime >= (duration * 0.50)) { // Switch at 50% of video
      console.log('=== VIDEO 50% POINT REACHED ===');
      console.log('Switching to Viewer 3 content at 50% of video');
      console.log('Current time:', currentTime, 'Duration:', duration);
      
      // Remove this event listener to prevent multiple calls for content switching
      video.removeEventListener('timeupdate', handleTimeUpdate);
      
      // But add a new listener just for filter management
      video.addEventListener('timeupdate', handleFilterOnly);
      
      console.log('Showing Viewer 3 content while video continues playing');
      
      // Display Viewer 3 content but keep video playing
      displayViewer3Content().then(() => {
        console.log('displayViewer3Content completed');
        isTransitioning = false;
        console.log('isTransitioning set to false');
        
        // Reset scroll to top after content switch
        const container = document.getElementById('tableContainer');
        if (container) {
          container.scrollTop = 0;
          container.style.setProperty('--scroll-y', '0px');
          console.log('Reset Viewer 3 scroll to top');
          
          // Don't restart scroll immediately - let it continue from the existing scroll cycle
          console.log('Scroll will continue from existing cycle');
        }
      }).catch(error => {
        console.error('Error in displayViewer3Content:', error);
        isTransitioning = false;
      });
    }
  }
  
  // Separate function just for filter management (continues after 50%)
  function handleFilterOnly() {
    const currentTime = video.currentTime;
    const duration = video.duration;
    
  }
  
  console.log('Adding video timeupdate event listener for 50% switch to Viewer 3');
  video.addEventListener('timeupdate', handleTimeUpdate);
  
  // Handle video completion - fade out and hide video when video actually ends
  function handleVideoEnd() {
    console.log('=== VIDEO ENDED ===');
    console.log('Fading out video before hiding');
    
    video.removeEventListener('ended', handleVideoEnd);
    
    // Fade out over 0.5s
    setTimeout(() => {
      video.style.opacity = '0';
    }, 50); // Small delay for smooth transition
    
    // Hide after fade completes
    setTimeout(() => {
      video.style.display = 'none';
      video.style.visibility = 'hidden';
    }, 500);
  }
  
  video.addEventListener('ended', handleVideoEnd);
  
  // Also add a backup timer in case video timeupdate doesn't fire
  setTimeout(() => {
    if (currentMode === 'video') {
      console.log('Backup timer triggered - forcing 50% switch to Viewer 3');
      handleTimeUpdate();
    }
  }, 2000); // 2 second backup for 4-second video
}

async function startTransitionBackToViewer1() {
  console.log('=== START TRANSITION BACK TO VIEWER 1 ===');
  
  if (isTransitioning) {
    console.log('Transition already in progress, skipping');
    return;
  }
  
  isTransitioning = true;
  
  // Start video immediately - don't fade out content (keep it visible behind transparent video)
  console.log('Starting video transition with Viewer 2 content visible behind');
  startVideoTransitionBackToViewer1();
}

function startVideoTransitionBackToViewer1() {
  const timestamp = new Date().toISOString();
  const video = document.getElementById('transitionVideo');
  const tableContainer = document.getElementById('tableContainer');
  
  console.log(`[${timestamp}] === START VIDEO TRANSITION BACK TO VIEWER 1 ===`);
  console.log(`[${timestamp}] Video element found:`, !!video);
  console.log(`[${timestamp}] Table container found:`, !!tableContainer);
  
  if (video) {
    console.log(`[${timestamp}] Video current src:`, video.src);
    console.log(`[${timestamp}] Video duration:`, video.duration);
    console.log(`[${timestamp}] Video current time:`, video.currentTime);
    console.log(`[${timestamp}] Video readyState:`, video.readyState);
    console.log(`[${timestamp}] Video networkState:`, video.networkState);
  }
  
  // Show video directly covering the screen with fade in
  video.style.display = 'block';
  video.style.position = 'fixed';
  video.style.top = '0';
  video.style.left = '0';
  video.style.width = '100vw';
  video.style.height = '100vh';
  video.style.objectFit = 'cover';
  video.style.zIndex = '1000';
  video.style.visibility = 'visible';
  video.style.opacity = '0'; // Start invisible for fade in effect
  
  // Keep table visible behind video
  tableContainer.style.opacity = '1';
  
  // Stop current scrolling
  if (scrollInterval) {
    cancelAnimationFrame(scrollInterval);
    scrollInterval = null;
  }
  
  currentMode = 'video';
  
  console.log('Starting video for transition back to Viewer 1');
  
  // Start video directly and fade in
  video.play().then(() => {
    console.log('Video started successfully for transition back to Viewer 1');
    // Fade in over 0.5s
    setTimeout(() => {
      video.style.opacity = '1'; // Fade to visible
    }, 50); // Small delay for smooth transition
  }).catch(error => {
    console.error('Failed to start video for transition back to Viewer 1:', error);
  });
  
  // Handle video time update to switch content at 50% completion and manage filter
  function handleTimeUpdate() {
    const currentTime = video.currentTime;
    const duration = video.duration;
    
    
    if (duration && currentTime >= (duration * 0.50)) { // Switch at 50% of video
      console.log('=== VIDEO 50% POINT REACHED ===');
      console.log('Switching to Viewer 1 content at 50% of video');
      console.log('Current time:', currentTime, 'Duration:', duration);
      
      // Remove this event listener to prevent multiple calls for content switching
      video.removeEventListener('timeupdate', handleTimeUpdate);
      
      // But add a new listener just for filter management
      video.addEventListener('timeupdate', handleFilterOnly);
      
      console.log('Showing Viewer 1 content while video continues playing');
      
      // Display Viewer 1 content but keep video playing
      displayViewer1Content().then(() => {
        console.log('displayViewer1Content completed');
        isTransitioning = false;
        console.log('isTransitioning set to false');
        
        // Reset scroll to top after content switch
        const container = document.getElementById('tableContainer');
        if (container) {
          container.scrollTop = 0;
          container.style.setProperty('--scroll-y', '0px');
          console.log('Reset Viewer 1 scroll to top');
          
          // Don't restart scroll immediately - let it continue from the existing scroll cycle
          console.log('Scroll will continue from existing cycle');
        }
      }).catch(error => {
        console.error('Error in displayViewer1Content:', error);
        isTransitioning = false;
      });
    }
  }
  
  // Separate function just for filter management (continues after 50%)
  function handleFilterOnly() {
    const currentTime = video.currentTime;
    const duration = video.duration;
    
  }
  
  console.log('Adding video timeupdate event listener for 50% switch back to Viewer 1');
  video.addEventListener('timeupdate', handleTimeUpdate);
  
  // Handle video completion - fade out and hide video when video actually ends
  function handleVideoEnd() {
    console.log('=== VIDEO ENDED ===');
    console.log('Fading out video before hiding');
    
    video.removeEventListener('ended', handleVideoEnd);
    
    // Fade out over 0.5s
    setTimeout(() => {
      video.style.opacity = '0';
    }, 50); // Small delay for smooth transition
    
    // Hide after fade completes
    setTimeout(() => {
      video.style.display = 'none';
      video.style.visibility = 'hidden';
    }, 500);
  }
  
  video.addEventListener('ended', handleVideoEnd);
  
  // Also add a backup timer in case video timeupdate doesn't fire
  setTimeout(() => {
    if (currentMode === 'video') {
      console.log('Backup timer triggered - forcing 50% switch back to Viewer 1');
      handleTimeUpdate();
    }
  }, 2000); // 2 second backup for 4-second video
}

async function startTransitionSequence() {
  console.log('=== START TRANSITION SEQUENCE ===');
  
  if (isTransitioning) {
    console.log('Transition already in progress, skipping');
    return;
  }
  
  isTransitioning = true;
  
  // Start video immediately - don't fade out content (keep it visible behind transparent video)
  console.log('Starting video transition with Viewer 1 content visible behind');
  startVideoTransition();
}

function startVideoTransition() {
  const timestamp = new Date().toISOString();
  const video = document.getElementById('transitionVideo');
  const tableContainer = document.getElementById('tableContainer');
  
  console.log(`[${timestamp}] === START VIDEO TRANSITION ===`);
  console.log(`[${timestamp}] Video element found:`, !!video);
  console.log(`[${timestamp}] Table container found:`, !!tableContainer);
  
  if (video) {
    console.log(`[${timestamp}] Video current src:`, video.src);
    console.log(`[${timestamp}] Video duration:`, video.duration);
    console.log(`[${timestamp}] Video current time:`, video.currentTime);
    console.log(`[${timestamp}] Video readyState:`, video.readyState);
    console.log(`[${timestamp}] Video networkState:`, video.networkState);
  }
  
  // Show video directly covering the screen with fade in
  video.style.display = 'block';
  video.style.position = 'fixed';
  video.style.top = '0';
  video.style.left = '0';
  video.style.width = '100vw';
  video.style.height = '100vh';
  video.style.objectFit = 'cover';
  video.style.zIndex = '1000';
  video.style.visibility = 'visible';
  video.style.opacity = '0'; // Start invisible for fade in effect
  
  // Keep table visible behind video
  tableContainer.style.opacity = '1';
  
  // Stop current scrolling
  if (scrollInterval) {
    cancelAnimationFrame(scrollInterval);
    scrollInterval = null;
  }
  
  currentMode = 'video';
  
  console.log('Starting video for transition to Viewer 2');
  
  // Start video directly and fade in
  video.play().then(() => {
    console.log('Video started successfully');
    // Fade in over 0.5s
    setTimeout(() => {
      video.style.opacity = '1'; // Fade to visible
    }, 50); // Small delay for smooth transition
  }).catch(error => {
    console.error('Failed to start video:', error);
  });
  
  // Handle video time update to switch content at 50% completion and manage filter
  function handleTimeUpdate() {
    const currentTime = video.currentTime;
    const duration = video.duration;
    
    
    if (duration && currentTime >= (duration * 0.50)) { // Switch at 50% of video
      console.log('=== VIDEO 50% POINT REACHED ===');
      console.log('Switching to Viewer 2 content at 50% of video');
      console.log('Current time:', currentTime, 'Duration:', duration);
      
      // Remove this event listener to prevent multiple calls for content switching
      video.removeEventListener('timeupdate', handleTimeUpdate);
      
      // But add a new listener just for filter management
      video.addEventListener('timeupdate', handleFilterOnly);
      
      console.log('Showing Viewer 2 content while video continues playing');
      
      // Display Viewer 2 content but keep video playing
      displayViewer2Content().then(() => {
        console.log('displayViewer2Content completed');
        isTransitioning = false;
        console.log('isTransitioning set to false');
        
        // Reset scroll to top after content switch
        const container = document.getElementById('tableContainer');
        if (container) {
          container.scrollTop = 0;
          container.style.setProperty('--scroll-y', '0px');
          console.log('Reset Viewer 2 scroll to top');
          
          // Don't restart scroll immediately - let it continue from the existing scroll cycle
          console.log('Scroll will continue from existing cycle');
        }
      }).catch(error => {
        console.error('Error in displayViewer2Content:', error);
        isTransitioning = false;
      });
    }
  }
  
  // Separate function just for filter management (continues after 50%)
  function handleFilterOnly() {
    const currentTime = video.currentTime;
    const duration = video.duration;
    
  }
  
  console.log('Adding video timeupdate event listener for 50% switch');
  video.addEventListener('timeupdate', handleTimeUpdate);
  
  // Handle video completion - fade out and hide video when video actually ends
  function handleVideoEnd() {
    console.log('=== VIDEO ENDED ===');
    console.log('Fading out video before hiding');
    
    video.removeEventListener('ended', handleVideoEnd);
    
    // Fade out over 0.5s
    setTimeout(() => {
      video.style.opacity = '0';
    }, 50); // Small delay for smooth transition
    
    // Hide after fade completes
    setTimeout(() => {
      video.style.display = 'none';
      video.style.visibility = 'hidden';
    }, 500);
  }
  
  video.addEventListener('ended', handleVideoEnd);
  
  // Also add a backup timer in case video timeupdate doesn't fire
  setTimeout(() => {
    if (currentMode === 'video') {
      console.log('Backup timer triggered - forcing 50% switch');
      handleTimeUpdate();
    }
  }, 2000); // 2 second backup for 4-second video
}

window.addEventListener('DOMContentLoaded', async () => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] === DOM CONTENT LOADED ===`);
  console.log(`[${timestamp}] Transition Viewer page loaded successfully`);
  
  // Settings removed - using hardcoded values
  await loadBothExcelFiles();
  console.log(`[${timestamp}] About to call loadBothExcelFiles()`);

  // Add keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Key pressed: ${e.key}, currentMode: ${currentMode}`);
    
    if (e.key === 'F2' || e.key === 'Backspace') {
      console.log(`[${timestamp}] ${e.key} key pressed - closing Honour Board window`);
      // Use the closeCurrentWindow API to properly close the window
      if (window.api && window.api.closeCurrentWindow) {
        window.api.closeCurrentWindow().then(() => {
          console.log(`[${timestamp}] Honour Board window closed successfully`);
        }).catch(err => {
          console.error(`[${timestamp}] Error closing Honour Board window:`, err);
          // Fallback: try to close window directly
          window.close();
        });
      } else {
        // Fallback: try to close window directly
        console.log(`[${timestamp}] API not available, closing window directly`);
        window.close();
      }
    }
  });
});
