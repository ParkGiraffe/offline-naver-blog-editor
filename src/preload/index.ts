import { contextBridge } from 'electron';
contextBridge.exposeInMainWorld('giraffe', {});
