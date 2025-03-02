import { app, BrowserWindow, globalShortcut, ipcMain } from "electron";
import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
let mainWindow;
app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    resizable: true,
    autoHideMenuBar: true,
    alwaysOnTop: true,
    skipTaskbar: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      // Ensure preload path is correct
      contextIsolation: true,
      enableRemoteModule: false,
      sandbox: false,
      nodeIntegration: false
      // Must be false for contextBridge to work
    }
  });
  mainWindow.webContents.openDevTools();
  mainWindow.loadURL("http://localhost:5173");
  globalShortcut.register("F6", () => {
    console.log("F6 pressed! Moving the cursor...");
    moveCursorAndClick();
  });
  ipcMain.on("draw-path", (event, points) => {
    console.log("Received points:", points.length);
    drawWithMouse(points);
  });
  ipcMain.on("move-mouse", () => {
    console.log("Button clicked! Moving the cursor...");
    moveCursorAndClick();
  });
  app.on("will-quit", () => {
    globalShortcut.unregisterAll();
  });
});
function moveCursorAndClick() {
  exec("nircmd.exe setcursor 500 500");
  exec("nircmd.exe sendmouse left click");
}
function drawWithMouse(points) {
  if (!points.length) return;
  let index = 0;
  const interval = setInterval(() => {
    if (index >= points.length) {
      clearInterval(interval);
      return;
    }
    const { x, y } = points[index];
    exec(`nircmd.exe setcursor ${Math.round(x)} ${Math.round(y)}`);
    if (index % 5 === 0) {
      exec("nircmd.exe sendmouse left down");
      exec("nircmd.exe sendmouse left up");
    }
    index++;
  }, 50);
}
