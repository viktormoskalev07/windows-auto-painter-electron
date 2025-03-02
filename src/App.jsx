import React, {useState, useEffect, useRef} from "react";
import {StartPosition} from "./startPosition/startPosition.jsx";
import {processImage} from "./utils/processImage.js";

import {SvgBuilder} from "./svgBuilder/svgBuilder.jsx";

const InputWithLabel = ({label, max, value, onChange}) => (
    <div style={{marginBottom: "15px"}}>
        <label style={{marginRight: "10px", fontWeight: "bold"}}>
            {label}:
            <input
                style={{marginLeft: "10px"}}
                type="range"
                min="0"
                max={max}
                value={value}
                onChange={onChange}
            />
        </label>
        <span> {value}</span>
    </div>
);

function App() {
    const [image, setImage] = useState(null);
    const [modifiedImage, setModifiedImage] = useState(null);
    const [points, setPoints] = useState([]);
    const [shift, setShift] = useState({x: 2400, y: 800});
    const [brightnessThreshold, setBrightnessThreshold] = useState(128);
    const [quality, setQuality] = useState(128);
    const [settings, setSettings] = useState({scale: 10, oneLine: false});
    const scale = settings.scale;

    const processImageWrapper = (updates) => {
        processImage({
            imageSource: image,
            brightnessThreshold,
            setModifiedImage,
            setPoints,
            quality,
            scale,
            ...updates,
        });
    };

    useEffect(() => {
        const shiftedPoint = points.map(p => {
            return {
                x: Number(p.x) + Number(shift.x),
                y: Number(p.y) + Number(shift.y)
            };
        });
        try {
            window.electron.loadPoints(shiftedPoint ,settings);
        } catch (e) {
            console.log(e);
        }
    }, [points, shift]);

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImage(e.target.result);
                processImageWrapper({imageSource: e.target.result});
            };
            reader.readAsDataURL(file);
        }
    };

    const imgRef = useRef();
    const generatePoints = () => {
        processImageWrapper({});
    };

    return (
        <div style={{textAlign: "center", padding: "30px", fontFamily: "Arial, sans-serif"}}>
            <div style={{display: "flex", justifyContent: "center", gap: "20px"}}>
                <div>
                    <p style={{color: "#333", marginBottom: "20px"}}>Mouse Drawer</p>
                    <p> f6 - start</p>
                    <p> f5 - stop</p>
                </div>

                <StartPosition shift={shift} setShift={setShift}/>

                <div style={{margin: "20px 0"}}>
                    <input style={buttonStyle} ref={imgRef} type="file" onChange={handleImageUpload}/>
                    <button onClick={generatePoints} style={buttonStyle}>Регенерировать точки</button>
                    <button onClick={() => window.electron.sendPoints(points)} style={buttonStyle}>
                        Запустить
                    </button>
                </div>
            </div>

            <div style={{margin: "20px 0", display: "flex", gap: "20px"}}>
                <div>
                    <InputWithLabel
                        label="Яркость"
                        max="255"
                        value={brightnessThreshold}
                        onChange={(e) => {
                            setBrightnessThreshold(e.target.value);
                            processImageWrapper({brightnessThreshold: e.target.value});
                        }}
                    />
                    <InputWithLabel
                        label="Качество"
                        max="600"
                        value={quality}
                        onChange={(e) => {
                            setQuality(e.target.value);
                            processImageWrapper({quality: e.target.value});
                        }}
                    />
                    <InputWithLabel
                        label="Масштаб"
                        max="50"
                        value={scale}
                        onChange={(e) => {
                            setSettings(prev => ({...prev, scale: e.target.value}));
                            processImageWrapper({scale: e.target.value});
                        }}
                    />
                    <label  >
                        <input checked={settings.oneLine} onChange={(e)=>{
                            setSettings(p=>{return{...p , oneLine:e.target.checked}})
                        }} type="checkbox"/>
                        рисовать не отрывая руку?
                    </label>
                    <h3>Количество точек: {points.length}</h3>
                </div>
                <div  >
                    {image && <img src={image} alt="Uploaded" width="200"/>}
                    {modifiedImage && <img src={modifiedImage} alt="Modified" width="200"/>}
                </div>
            </div>
            <SvgBuilder points={points}/>
        </div>
    );
}

// Стиль кнопок
const buttonStyle = {
    fontSize: "16px",
    padding: "10px 20px",
    margin: "5px",
    cursor: "pointer",
    backgroundColor: "#007BFF",
    color: "white",
    border: "none",
    borderRadius: "5px",
    transition: "0.3s",
};

export default App;
