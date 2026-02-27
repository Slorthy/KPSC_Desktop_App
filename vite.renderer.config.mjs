import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        // "main" is your index.html
        main: './index.html', 
        // These must match the actual names of your files
        image_board: './Image_Board.html',
        fullscreen_viewer: './Fullscreen_Image_Viewer.html',
        transition_viewer: './Honour_Board_Transition_Viewer.html',
      },
    },
  },
});