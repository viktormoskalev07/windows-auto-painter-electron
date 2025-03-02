const { contextBridge, ipcRenderer } = require('electron');

console.log("✅ Preload script loaded!"); // Проверка загрузки

contextBridge.exposeInMainWorld("electron", {
    sendPoints: (points) => ipcRenderer.send("draw-path", points),
});