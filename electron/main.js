import { app, BrowserWindow, ipcMain, globalShortcut } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { startDrawing, stopDrawing } from "./mouseDrawer.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let mainWindow;
let lastPoints = []; // Храним последние точки
let lastSettings = []; // Храним последние точки

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        resizable: true,
        autoHideMenuBar: true,
        alwaysOnTop: false,
        webPreferences: {
            preload: path.join(__dirname, "preload.cjs"),
            contextIsolation: true,
            enableRemoteModule: false,
            sandbox: false,
        },
    });
    app.commandLine.appendSwitch("high-dpi-support", "1");
    app.commandLine.appendSwitch("force-device-scale-factor", "1");
    mainWindow.webContents.openDevTools();
    mainWindow.loadURL("http://localhost:5173");

    ipcMain.on("load-points", (event, points , settings) => {
        lastPoints = points; // Загружаем точки без старта
        lastSettings=settings
        console.log(`✅ Points loaded (${points.length} points)`);
    });

    ipcMain.on("draw-path", (event, points , settings) => {
        lastPoints = points;
        lastSettings=settings
        console.log(`🎨 Starting drawing from cursor position`);
        startDrawing(points ,settings);
    });

    globalShortcut.register("F6", () => {
        console.log("▶️ Starting drawing...");
        startDrawing(lastPoints , lastSettings);
    });

    globalShortcut.register("F7", () => {
        console.log("⏹️ Stopping drawing...");
        stopDrawing();
    });

    app.on("will-quit", () => {
        globalShortcut.unregisterAll();
    });
});
