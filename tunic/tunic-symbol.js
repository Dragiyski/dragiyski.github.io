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
    },
    distance(point, tolerance = Number.POSITIVE_INFINITY) {
        const style = this.style;
        const gx = style.gx;
        const gy = style.gy;
        const line = lines[this.index];
        const distance = distanceToLine(point, [gx[points[line[0]][0]], gy[points[line[0]][1]]], [gx[points[line[1]][0]], gy[points[line[1]][1]]]);
        if (distance <= tolerance) {
            return distance;
        }
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
    },
    distance(point, tolerance = Number.POSITIVE_INFINITY) {
        const context = this.context;
        const style = this.style;
        const radius = style.circleRadius;
        const x = style.gx[points[11][0]];
        const y = style.gy[points[11][1]] + radius;
        const distance = distanceToPoint(point, [x, y]);
        if (distance <= tolerance) {
            return distance;
        }
    }
});

function distanceToLine(p, p1, p2) {
    const base = [p[0] - p1[0], p[1] - p1[1]];
    let line = [p2[0] - p1[0], p2[1] - p1[1]];
    const lineLength = Math.sqrt(line[0] * line[0] + line[1] * line[1]);
    line = line.map(c => c / lineLength);
    const dot = base[0] * line[0] + base[1] * line[1];
    if (dot < 0) {
        const diff = [p[0] - p1[0], p[1] - p1[1]];
        return Math.sqrt(diff[0] * diff[0] + diff[1] * diff[1]);
    } else if (dot > lineLength) {
        const diff = [p[0] - p2[0], p[1] - p2[1]];
        return Math.sqrt(diff[0] * diff[0] + diff[1] * diff[1]);
    }
    const projection = [p1[0] + dot * line[0], p1[1] + dot * line[1]];
    const projecting = [projection[0] - p[0], projection[1] - p[1]];
    return Math.sqrt(projecting[0] * projecting[0] + projecting[1] * projecting[1]);
}

function distanceToPoint(p, c) {
    const d = [p[0] - c[0], p[1] - c[1]];
    const sqr = d[0] * d[0] + d[1] * d[1];
    return Math.sqrt(sqr);
}