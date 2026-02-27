import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  saveFile: (name, arrayBuffer) => ipcRenderer.invoke('save-file', { name, buffer: Buffer.from(arrayBuffer) }),
  getStoredPath: () => ipcRenderer.invoke('get-stored-file-path'),
  readStoredFile: () => ipcRenderer.invoke('read-stored-file'),
  readStoredFileForViewer2: () => ipcRenderer.invoke('read-stored-file-viewer2'),
  readStoredFileForViewer3: () => ipcRenderer.invoke('read-stored-file-viewer3'),
  openViewer: () => ipcRenderer.invoke('open-viewer-window'),
  openImageBoard: () => ipcRenderer.invoke('open-image-board'),
  openTransitionViewer: () => ipcRenderer.invoke('open-transition-viewer-window'),
  openImagesFolder: () => ipcRenderer.invoke('open-images-folder'),
  getImagesFromFolder: (folder) => ipcRenderer.invoke('get-images-from-folder', folder),
  openFullscreenImageViewer: (images, start) => ipcRenderer.invoke('open-fullscreen-image-viewer', images, start),
  getFullscreenData: () => ipcRenderer.invoke('get-fullscreen-data')
});