import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: { outDir: 'out/main', lib: { entry: 'src/main/main.ts' } },
    resolve: { alias: { '@main': resolve('src/main'), '@shared': resolve('src/shared') } },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: { outDir: 'out/preload', lib: { entry: 'src/preload/index.ts' } },
  },
  renderer: {
    root: 'src/renderer',
    build: { outDir: 'out/renderer', rollupOptions: { input: 'src/renderer/index.html' } },
    plugins: [react()],
    resolve: { alias: { '@renderer': resolve('src/renderer'), '@shared': resolve('src/shared') } },
  },
});
