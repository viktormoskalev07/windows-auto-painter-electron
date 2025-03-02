import { screen, app, BrowserWindow, ipcMain, globalShortcut } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";
let isDrawing = false;
let interval = null;
let currentMonitor = null;
function getCursorPosition() {
  const cursor = screen.getCursorScreenPoint();
  const display = screen.getDisplayNearestPoint(cursor);
  currentMonitor = display.id;
  const scaleFactor = display.scaleFactor || 1;
  console.log(`🖥️ Active Monitor ID: ${display.id}, DPI Scale: ${scaleFactor}`);
  return {
    x: (cursor.x - display.bounds.x) * scaleFactor,
    y: (cursor.y - display.bounds.y) * scaleFactor,
    scaleFactor,
    display
  };
}
function checkMonitorChange() {
  const cursor = screen.getCursorScreenPoint();
  const display = screen.getDisplayNearestPoint(cursor);
  if (display.id !== currentMonitor) {
    console.log(`🔄 Monitor changed! New Monitor ID: ${display.id}`);
    currentMonitor = display.id;
    return getCursorPosition();
  }
  return null;
}
function startDrawing(points) {
  if (isDrawing) return;
  let { x: startX, y: startY, scaleFactor } = getCursorPosition();
  isDrawing = true;
  let index = 0;
  interval = setInterval(() => {
    if (!isDrawing || index >= points.length) {
      stopDrawing();
      return;
    }
    const { x, y } = points[index];
    const newMonitor = checkMonitorChange();
    if (newMonitor) {
      startX = newMonitor.x;
      startY = newMonitor.y;
      scaleFactor = newMonitor.scaleFactor;
    }
    const adjX = Math.round((startX + x) / scaleFactor);
    const adjY = Math.round((startY + y) / scaleFactor);
    console.log(`🎯 Adjusted coords: x=${adjX}, y=${adjY} (Monitor: ${currentMonitor})`);
    exec(`nircmd.exe setcursor ${adjX} ${adjY}`);
    if (index % 5 === 0) {
      exec("nircmd.exe sendmouse left down");
      exec("nircmd.exe sendmouse left up");
    }
    index++;
  }, 50);
}
function stopDrawing() {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
  isDrawing = false;
  console.log("🛑 Drawing stopped!");
}
const __dirname = path.dirname(fileURLToPath(import.meta.url));
let mainWindow;
let lastPoints = [];
app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    resizable: true,
    autoHideMenuBar: true,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      enableRemoteModule: false,
      sandbox: false
    }
  });
  app.commandLine.appendSwitch("high-dpi-support", "1");
  app.commandLine.appendSwitch("force-device-scale-factor", "1");
  mainWindow.webContents.openDevTools();
  mainWindow.loadURL("http://localhost:5173");
  ipcMain.on("load-points", (event, points) => {
    lastPoints = points;
    console.log(`✅ Points loaded (${points.length} points)`);
  });
  ipcMain.on("draw-path", (event, points) => {
    lastPoints = points;
    console.log(`🎨 Starting drawing from cursor position`);
    startDrawing(points);
  });
  globalShortcut.register("F6", () => {
    console.log("▶️ Starting drawing...");
    startDrawing(lastPoints);
  });
  globalShortcut.register("F7", () => {
    console.log("⏹️ Stopping drawing...");
    stopDrawing();
  });
  app.on("will-quit", () => {
    globalShortcut.unregisterAll();
  });
});
