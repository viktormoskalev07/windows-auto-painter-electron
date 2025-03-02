const { contextBridge, ipcRenderer } = require('electron');




console.log("✅ Preload script loaded!");

contextBridge.exposeInMainWorld("electron", {
    loadPoints: (points ,settings) => ipcRenderer.send("load-points", points , settings),
    sendPoints: (points ,settings) => ipcRenderer.send("draw-path", points , settings),
});
