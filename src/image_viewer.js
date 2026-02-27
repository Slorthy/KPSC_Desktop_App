import './index.css';

window.addEventListener('DOMContentLoaded', async () => {
  const picker = document.getElementById('picker');
  const content = document.getElementById('content');
  const clickCatcher = document.getElementById('clickCatcher');
  const placeholder = document.getElementById('placeholder');
  const tiles = [
    document.getElementById('t0'),
    document.getElementById('t1'),
    document.getElementById('t2'),
    document.getElementById('t3')
  ];

  function clearTiles() {
    tiles.forEach(t => { t.innerHTML = ''; });
  }

  function showImageUrls(urls) {
    if (!urls || urls.length === 0) return;
    placeholder.style.display = 'none';
    clearTiles();
    for (let i = 0; i < Math.min(4, urls.length); i++) {
      const img = document.createElement('img');
      img.src = urls[i];
      tiles[i].appendChild(img);
    }
  }

  function showImages(files) {
    const imgs = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (imgs.length === 0) return;
    placeholder.style.display = 'none';
    clearTiles();
    // Show up to 4 images in tiles
    for (let i = 0; i < Math.min(4, imgs.length); i++) {
      const url = URL.createObjectURL(imgs[i]);
      const img = document.createElement('img');
      img.src = url;
      img.onload = () => URL.revokeObjectURL(url);
      tiles[i].appendChild(img);
    }
  }

  // Click anywhere to pick images
  clickCatcher?.addEventListener('click', () => picker?.click());

  // Handle chooser selection
  picker?.addEventListener('change', () => {
    if (picker.files && picker.files.length > 0) {
      showImages(picker.files);
    }
  });

  // Drag & drop support
  ;['dragenter','dragover','dragleave','drop'].forEach(evt => {
    content.addEventListener(evt, e => {
      e.preventDefault();
      e.stopPropagation();
    });
  });
  content.addEventListener('drop', e => {
    const dt = e.dataTransfer;
    if (!dt) return;
    const files = dt.files;
    if (files && files.length) {
      showImages(files);
    }
  });

  try {
    const res = await window.api.getInternalImages?.();
    if (res && res.success && Array.isArray(res.images) && res.images.length > 0) {
      showImageUrls(res.images);
    }
  } catch {}
});
