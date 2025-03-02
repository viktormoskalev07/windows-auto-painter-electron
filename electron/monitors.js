import { screen } from "electron";

/**
 * Получает список всех мониторов.
 * @returns {Array} Список мониторов с их размерами и позициями.
 */
export function getMonitors() {
    const displays = screen.getAllDisplays();
    return displays.map((display, index) => ({
        id: index + 1,
        width: display.bounds.width,
        height: display.bounds.height,
        x: display.bounds.x,
        y: display.bounds.y,
    }));
}

/**
 * Выбирает монитор по его ID (номер 1, 2 или 3).
 * @param {number} monitorId - Номер монитора.
 * @returns {Object | null} Координаты и размеры монитора или null.
 */
export function getMonitorById(monitorId) {
    const displays = getMonitors();
    return displays.find((display) => display.id === monitorId) || null;
}
