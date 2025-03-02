export const  sortPointsByProximity=(points) =>{
    if (points.length === 0) return [];

    const sorted = [];
    const remaining = [...points]; // Копируем массив, чтобы не менять оригинал

    // Берём первую точку как стартовую
    sorted.push(remaining.shift());

    while (remaining.length > 0) {
        const lastPoint = sorted[sorted.length - 1];

        // Ищем ближайшую точку
        let nearestIndex = 0;
        let minDistance = Infinity;

        for (let i = 0; i < remaining.length; i++) {
            const dx = remaining[i].x - lastPoint.x;
            const dy = remaining[i].y - lastPoint.y;
            const distance = dx * dx + dy * dy; // Квадрат расстояния (без корня, так быстрее)

            if (distance < minDistance) {
                minDistance = distance;
                nearestIndex = i;
            }
        }

        // Добавляем ближайшую точку в отсортированный массив
        sorted.push(remaining.splice(nearestIndex, 1)[0]);
    }

    return sorted;
}

