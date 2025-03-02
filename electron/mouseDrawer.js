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
    const display = screen.getDisplayNearestPoint(cursor);

    currentMonitor = display.id; // Запоминаем текущий монитор
    const scaleFactor = display.scaleFactor || 1;

    console.log(`🖥️ Active Monitor ID: ${display.id}, DPI Scale: ${scaleFactor}`);

    return {
        x: (cursor.x - display.bounds.x) * scaleFactor,
        y: (cursor.y - display.bounds.y) * scaleFactor,
        scaleFactor,
        display,
    };
}

/**
 * Проверяет, не перешёл ли курсор на другой монитор.
 */
function checkMonitorChange() {
    const cursor = screen.getCursorScreenPoint();
    const display = screen.getDisplayNearestPoint(cursor);

    if (display.id !== currentMonitor) {
        console.log(`🔄 Monitor changed! New Monitor ID: ${display.id}`);
        currentMonitor = display.id;
        return getCursorPosition(); // Возвращаем обновлённые координаты и scaleFactor
    }
    return null;
}

/**
 * Запускает рисование с автоматическим учётом DPI каждого монитора.
 */
export function startDrawing(points) {
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

        // Проверяем смену монитора во время рисования
        const newMonitor = checkMonitorChange();
        if (newMonitor) {
            startX = newMonitor.x;
            startY = newMonitor.y;
            scaleFactor = newMonitor.scaleFactor;
        }

        // Корректируем координаты перед отправкой в nircmd.exe
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
