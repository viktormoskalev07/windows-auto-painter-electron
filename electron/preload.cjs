const { contextBridge, ipcRenderer } = require('electron');




console.log("✅ Preload script loaded!");

contextBridge.exposeInMainWorld("electron", {
    loadPoints: (points) => ipcRenderer.send("load-points", points),
    sendPoints: (points) => ipcRenderer.send("draw-path", points),
});
