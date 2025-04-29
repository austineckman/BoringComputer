export const trimCanvas = (canvas) => {
    console.log(canvas.width, canvas.height);
    // pass { willReadFrequently: true } to getContext
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const w = imageData.width;
    const h = imageData.height;
    const data = new Uint32Array(imageData.data.buffer);

    let top = null, left = null, right = null, bottom = null;

    findBounds: {
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                if (data[y * w + x] !== 0) {
                    top = y;
                    break findBounds;
                }
            }
        }
    }

    if (top === null) {
        // The image is completely empty
        return null;
    }

    findBounds: {
        for (let y = h - 1; y >= top; y--) {
            for (let x = 0; x < w; x++) {
                if (data[y * w + x] !== 0) {
                    bottom = y;
                    break findBounds;
                }
            }
        }
    }

    findBounds: {
        for (let x = 0; x < w; x++) {
            for (let y = top; y <= bottom; y++) {
                if (data[y * w + x] !== 0) {
                    left = x;
                    break findBounds;
                }
            }
        }
    }

    findBounds: {
        for (let x = w - 1; x >= left; x--) {
            for (let y = top; y <= bottom; y++) {
                if (data[y * w + x] !== 0) {
                    right = x;
                    break findBounds;
                }
            }
        }
    }

    // Create a second canvas and context for getImageData call
    const readCanvas = document.createElement('canvas');
    readCanvas.width = canvas.width;
    readCanvas.height = canvas.height;
    const readCtx = readCanvas.getContext('2d', { willReadFrequently: true });

    // Draw the image onto the reading canvas
    readCtx.drawImage(canvas, 0, 0);

    // Call getImageData on the reading context
    const trimmedData = readCtx.getImageData(left, top, right - left + 1, bottom - top + 1);

    const trimmedCanvas = document.createElement('canvas');
    trimmedCanvas.width = right - left + 1;
    trimmedCanvas.height = bottom - top + 1;
    trimmedCanvas.getContext('2d').putImageData(trimmedData, 0, 0);

    console.log(trimmedCanvas.width, trimmedCanvas.height);
    return trimmedCanvas;
}
