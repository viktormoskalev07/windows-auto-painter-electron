import React, {useState, useEffect, useRef} from "react";
import {StartPosition} from "./startPosition/startPosition.jsx";
import {processImage} from "./utils/processImage.js";
import styles from "./styles.module.scss"
import {SvgBuilder} from "./svgBuilder/svgBuilder.jsx";
function App() {
    const [image, setImage] = useState(null);
    const [modifiedImage, setModifiedImage] = useState(null);
    const [points, setPoints] = useState([]);
    const [shift, setShift] = useState({x: 2400, y: 800});
    const [brightnessThreshold, setBrightnessThreshold] = useState(128);
    const [quality, setQuality] = useState(128);

    useEffect(() => {
        const shiftedPoint = points.map(p => {
            return {
                x: Number(p.x) + Number(shift.x),
                y: Number(p.y) + Number(shift.y)
            };
        });
        try {
            window.electron.loadPoints(shiftedPoint);
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
                processImage({imageSource:e.target.result , brightnessThreshold , setModifiedImage , setPoints ,quality});
            };
            reader.readAsDataURL(file);
        }
    };


    const imgRef = useRef();
    const generatePoints = () => {
        processImage({imageSource:image , brightnessThreshold , setModifiedImage , setPoints ,quality});
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
                    <input style={buttonStyle} ref={imgRef} type="file" onChange={handleImageUpload}  />
                    <button onClick={generatePoints} style={buttonStyle}>Регенерировать точки</button>
                    <button onClick={() => window.electron.sendPoints(points)} style={buttonStyle}>
                        Запустить
                    </button>
                </div>
            </div>


            <div style={{margin: "20px 0" , display: "flex",   gap: "20px"}}>
                <div style={{margin: "20px 0"}}>
                    <label style={{marginRight: "10px", fontWeight: "bold"}}>Яркость:
                    <input
                        type="range"
                        min="0"
                        max="255"
                        value={brightnessThreshold}
                        onChange={(e) => {
                            processImage({imageSource:image , brightnessThreshold:e.target.value , setModifiedImage , setPoints ,quality});
                            setBrightnessThreshold(e.target.value)
                        }}
                    />
                    </label>
                    <br/>
                    <label htmlFor="">
                        Качество
                        <input
                            type="range"
                            min="0"
                            max="600"
                            value={quality}
                            onChange={(e) => {
                                processImage({imageSource:image , brightnessThreshold , setModifiedImage , setPoints ,quality:e.target.value});
                                setQuality(e.target.value)
                            }}
                        />
                    </label>
                    <h3>Количество точек: {points.length}</h3>
                </div>
                <div
                    style={{display: "flex", justifyContent: "center", gap: "20px", alignItems: "center", height: "200px"}}>
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
