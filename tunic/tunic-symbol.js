export const points = [
    [1, 0], // 00
    [0, 1], // 01
    [2, 1], // 02
    [1, 2], // 03
    [0, 3], // 04
    [1, 3], // 05
    [2, 3], // 06
    [0, 4], // 07
    [1, 4], // 08
    [0, 5], // 09
    [2, 5], // 10
    [1, 6] //  11
];

export const lines = [
    [2, 0],
    [0, 1],
    [1, 4],
    [7, 9],
    [9, 11],
    [11, 10],
    [3, 2],
    [5, 0],
    [3, 1],
    [8, 9],
    [8, 11],
    [8, 10]
];

export const baseElement = Object.assign(Object.create(null), {
    highlighted: false,
    active: false
});

export const lineElement = Object.assign(Object.create(null), {
    ...baseElement,
    draw() {
        const style = this.style;
        const gx = style.gx;
        const gy = style.gy;
        const context = this.context;
        const line = lines[this.index];
        context.beginPath();
        context.moveTo(gx[points[line[0]][0]], gy[points[line[0]][1]]);
        context.lineTo(gx[points[line[1]][0]], gy[points[line[1]][1]]);
        context.closePath();
        context.stroke();
    }
});

export const circleElement = Object.assign(Object.create(null), {
    ...baseElement,
    draw() {
        const context = this.context;
        const style = this.style;
        const radius = style.circleRadius;
        const x = style.gx[points[11][0]];
        const y = style.gy[points[11][1]];
        context.beginPath();
        context.moveTo(x, y);
        context.arc(x, y + radius, radius, 3 * Math.PI / 2, 7 * Math.PI / 2);
        context.closePath();
        context.stroke();
    }
});
