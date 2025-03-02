import { screen, app, BrowserWindow, ipcMain, globalShortcut } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";
const sortPointsByProximity = (points) => {
  if (points.length === 0) return [];
  const sorted = [];
  const remaining = [...points];
  sorted.push(remaining.shift());
  while (remaining.length > 0) {
    const lastPoint = sorted[sorted.length - 1];
    let nearestIndex = 0;
    let minDistance = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const dx = remaining[i].x - lastPoint.x;
      const dy = remaining[i].y - lastPoint.y;
      const distance = dx * dx + dy * dy;
      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = i;
      }
    }
    sorted.push(remaining.splice(nearestIndex, 1)[0]);
  }
  return sorted;
};
let isDrawing = false;
function getCursorPosition() {
  const cursor = screen.getCursorScreenPoint();
  return {
    x: cursor.x,
    y: cursor.y
  };
}
function startDrawing(_points, settings) {
  console.log(settings);
  const points = sortPointsByProximity(_points);
  if (isDrawing) return;
  let { x: startX, y: startY } = getCursorPosition();
  isDrawing = true;
  let index = 0;
  let lastX = startX, lastY = startY;
  const loop = () => {
    if (!isDrawing || index >= points.length) {
      stopDrawing();
      return;
    }
    const { x, y } = points[index];
    const adjX = Math.round(startX + x);
    const adjY = Math.round(startY + y);
    if (adjX !== lastX || adjY !== lastY) {
      exec(`nircmd.exe setcursor ${adjX} ${adjY}`);
      exec("nircmd.exe sendmouse left down");
      if (!(settings == null ? void 0 : settings.oneLine)) {
        exec("nircmd.exe sendmouse left up");
      }
      lastX = adjX;
      lastY = adjY;
    }
    index++;
    setTimeout(loop, 1);
  };
  loop();
}
function stopDrawing() {
  isDrawing = false;
  console.log(" Drawing stopped!");
}
const __dirname = path.dirname(fileURLToPath(import.meta.url));
let mainWindow;
let lastPoints = [];
let lastSettings = [];
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
  ipcMain.on("load-points", (event, points, settings) => {
    lastPoints = points;
    lastSettings = settings;
    console.log(`✅ Points loaded (${points.length} points)`);
  });
  ipcMain.on("draw-path", (event, points, settings) => {
    lastPoints = points;
    lastSettings = settings;
    console.log(`🎨 Starting drawing from cursor position`);
    startDrawing(points, settings);
  });
  globalShortcut.register("F6", () => {
    console.log("▶️ Starting drawing...");
    startDrawing(lastPoints, lastSettings);
  });
  globalShortcut.register("F7", () => {
    console.log("⏹️ Stopping drawing...");
    stopDrawing();
  });
  app.on("will-quit", () => {
    globalShortcut.unregisterAll();
  });
});
