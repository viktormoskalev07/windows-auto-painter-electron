export const processImage = ({imageSource, setModifiedImage, setPoints, brightnessThreshold, quality}) => {
    const canvas = document.createElement('canvas');
    const img = new Image();
    img.src = imageSource;

    img.onload = () => {
        const maxWidth = quality;
        const maxHeight = quality;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
            if (width > height) {
                height = Math.floor((height * maxWidth) / width);
                width = maxWidth;
            } else {
                width = Math.floor((width * maxHeight) / height);
                height = maxHeight;
            }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const alpha = data[i + 3]; // Alpha channel
            if (alpha === 0) {
                data[i] = data[i + 1] = data[i + 2] = 255; // Make transparent pixels white
                continue;
            }
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            const brightness = gray < brightnessThreshold ? 0 : 255;
            data[i] = data[i + 1] = data[i + 2] = brightness; // Apply brightness threshold
        }
        ctx.putImageData(imageData, 0, 0);
        setModifiedImage(canvas.toDataURL()); // Save modified image

        const newPoints = [];
        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const index = (y * canvas.width + x) * 4;
                if (data[index] === 0 && data[index + 3] !== 0) { // Black pixels with non-transparent alpha
                    newPoints.push({x:x*10, y:y*10});
                }
            }
        }
        setPoints(newPoints);
    };
};