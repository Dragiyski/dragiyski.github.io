const map = Object.create(null);

export async function loadTexture(url) {
    if (typeof url === 'string') {
        url = new URL(url, document.baseURI);
    }
    if (url in map) {
        return map[url];
    }
    const response = await fetch(url);
    if (!response.ok) {
        throw ImageLoadError(`Unable to load image from: ${url}`);
    }
    if (response.url in map) {
        return map[response.url];
    }
    const blob = await response.blob();
    const img = new Image();
    img.src = URL.createObjectURL(blob);
    await img.decode();
    if (img.naturalWidth === 0 || img.naturalHeight === 0) {
        throw new ImageDecodeError(`Unable to decode image from: ${url}`);
    }
    const minSize = Math.min(img.naturalWidth, img.naturalHeight);
    const minPower = Math.min(65536, getNextPower2(minSize));
    const resizeCanvas = new OffscreenCanvas(minPower, minPower);
    const ctx = resizeCanvas.getContext('2d');
    ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, minPower, minPower);
    const data = Object.create(null);
    data.canvas = resizeCanvas;
    data.blob = ctx;
    data.image = ctx.getImageData(0, 0, minPower, minPower);
    data.naturalWidth = img.naturalWidth;
    data.naturalHeight = img.naturalHeight;
    data.width = data.height = minPower;
    data.url = response.url + '';
    data.requestUrl = url + '';
    return map[response.url] = data;
}

function isPower2(number) {
    return (number & (number - 1)) === 0;
}

function getNextPower2(number) {
    if (isPower2(number)) {
        return number;
    }
    let power = number;
    for (let i = 0; (1 << i) < number; ++i) {
        power |= power >> i;
    }
    return power + 1;
}

export class ImageError extends Error {}
export class ImageLoadError extends ImageError {}
export class ImageDecodeError extends ImageError {}
