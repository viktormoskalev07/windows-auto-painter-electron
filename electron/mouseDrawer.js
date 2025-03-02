import { exec } from "child_process";
import { screen } from "electron";

let isDrawing = false;
let interval = null;
let currentMonitor = null; // Текущий активный монитор

/**
 * Получает активный монитор и локальные координаты курсора.
 */
function getCursorPosition() {
    const cursor = screen.getCursorScreenPoint();
    return {
        x: cursor.x,
        y: cursor.y
    };
}

/**
 * Проверяет, не перешёл ли курсор на другой монитор.
 */


/**
 * Запускает рисование с автоматическим учётом DPI каждого монитора.
 */
export function startDrawing(points) {
    if (isDrawing) return;

    let { x: startX, y: startY } = getCursorPosition();
    isDrawing = true;
    let index = 0;
    let lastX = startX, lastY = startY;

    interval = setInterval(() => {
        if (!isDrawing || index >= points.length) {
            stopDrawing();
            return;
        }
        const { x, y } = points[index];
        const adjX = Math.round(startX + x);
        const adjY = Math.round(startY + y);

        if (adjX !== lastX || adjY !== lastY) {
            console.log(`🎯 Adjusted coords: x=${adjX}, y=${adjY} (Monitor: ${currentMonitor})`);
            exec("nircmd.exe sendmouse left up");
            exec(`nircmd.exe setcursor ${adjX} ${adjY}`);
            exec("nircmd.exe sendmouse left down");
            exec("nircmd.exe sendmouse left up");
            lastX = adjX;
            lastY = adjY;
        }

        index++;
    }, 5);
}

/**
 * Останавливает рисование.
 */
export function stopDrawing() {
    if (interval) {
        clearInterval(interval);
        interval = null;
    }
    isDrawing = false;
    console.log("🛑 Drawing stopped!");
}
