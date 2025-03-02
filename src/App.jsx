import React, { useState } from "react";

function App() {
    const [image, setImage] = useState(null);
    const [points, setPoints] = useState([]);

    // Функция загрузки изображения
    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => setImage(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    // Функция генерации точек (здесь можно заменить на алгоритм обработки)
    const generatePoints = () => {
        if (!image) return;
        const generatedPoints = [];
        for (let x = 100; x < 500; x += 10) {
            generatedPoints.push({ x, y: 300 + Math.sin(x / 50) * 100 }); // Рисуем синусоиду
        }
        setPoints(generatedPoints);
        window.electron.sendPoints(generatedPoints); // Отправляем точки в Electron
    };

    return (
        <div style={{ textAlign: "center", padding: "50px" }}>
            <h1>Mouse Drawer</h1>
            <input type="file" onChange={handleImageUpload} />
            <button onClick={generatePoints} disabled={!image}>
                Generate & Send Points
            </button>
            <div style={{ marginTop: "20px" }}>
                {image && <img src={image} alt="Uploaded" width="400" />}
                <svg width="400" height="400" style={{ position: "absolute", top: "200px" }}>
                    {points.map((p, index) => (
                        <circle key={index} cx={p.x / 2} cy={p.y / 2} r="3" fill="red" />
                    ))}
                </svg>
            </div>
        </div>
    );
}

export default App;
