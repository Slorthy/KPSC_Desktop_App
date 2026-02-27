import './index.css';

window.addEventListener('DOMContentLoaded', async () => {
  const backBtn = document.getElementById('backBtn');
  const openImageViewerBtn = document.getElementById('openImageViewerBtn');
  const manageImagesBtn = document.getElementById('manageImagesBtn');

  backBtn?.addEventListener('click', () => {
    window.location.href = './index.html';
  });

  openImageViewerBtn?.addEventListener('click', async () => {
    try {
      const res = await window.api.openImageViewer();
      if (!res?.success) {
        // Error logging disabled to prevent error messages
      }
    } catch (err) {
      // Error logging disabled to prevent error messages
    }
  });

  manageImagesBtn?.addEventListener('click', async () => {
    try {
      const res = await window.api.openImageViewer();
      if (!res?.success) {
        // Error logging disabled to prevent error messages
      }
    } catch (err) {
      // Error logging disabled to prevent error messages
    }
  });
});
