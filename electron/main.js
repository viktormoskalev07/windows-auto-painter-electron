import {app, BrowserWindow, ipcMain, globalShortcut} from 'electron';
import {exec} from 'child_process';
import path from 'path';
import {fileURLToPath} from 'url';

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
            preload: path.join(__dirname, 'preload.cjs'), // Ensure preload path is correct
            contextIsolation: true,
            enableRemoteModule: false,
            sandbox: false,
            nodeIntegration: false, // Must be false for contextBridge to work
        }
    });

    mainWindow.webContents.openDevTools(); // Open DevTools to debug preload.js
    mainWindow.loadURL('http://localhost:5173'); // Load React app

    // Register global hotkey F6
    globalShortcut.register('F6', () => {
        console.log('F6 pressed! Moving the cursor...');
        moveCursorAndClick();
    });
    ipcMain.on("draw-path", (event, points) => {
        console.log("Received points:", points.length);
        drawWithMouse(points);
    });

    // Listen for IPC event from renderer
    ipcMain.on('move-mouse', () => {
        console.log('Button clicked! Moving the cursor...');
        moveCursorAndClick();
    });

    app.on('will-quit', () => {
        globalShortcut.unregisterAll();
    });
});

// Function to move cursor and perform a click
function moveCursorAndClick() {
    exec('nircmd.exe setcursor 500 500');
    exec('nircmd.exe sendmouse left click');
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

        if (index % 5 === 0) { // Каждую 5-ю точку нажимаем ЛКМ
            exec("nircmd.exe sendmouse left down");
            exec("nircmd.exe sendmouse left up");
        }

        index++;
    }, 50); // Интервал движения
}