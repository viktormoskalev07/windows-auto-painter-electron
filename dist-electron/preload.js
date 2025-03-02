import { contextBridge, ipcRenderer } from "electron";
console.log("✅ Preload script loaded!");
contextBridge.exposeInMainWorld("electron", {
  moveMouse: () => ipcRenderer.send("move-mouse")
});
