import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';

export default defineConfig({
  plugins: [
    react(),
    electron({
      entry: 'electron/main.js', // Указываем путь к main.js Electron
    }  , {
      entry: 'electron/preload.js', // Компиляция preload.js, но без отдельного запуска
      onstart: (options) => options.reload(), // Обновляет страницу при изменении
    }),
  ],
});
