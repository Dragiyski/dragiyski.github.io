export function clearDebug() {
    const debug = document.getElementById('debug');
    if (debug != null) {
        debug.innerHTML = '';
    }
}
export function reportNumber(n) {
    n = n.toFixed(6);
    if (!n.startsWith('-')) {
        n = '+' + n;
    }
    return n;
}

export function appendDebugLine(line) {
    const debug = document.getElementById('debug');
    if (debug == null) {
        return;
    }
    const div = document.createElement('div');
    div.textContent = line;
    debug.appendChild(div);
}

export function reportVector(arr) {
    return '[' + arr.map(reportNumber).join(', ') + ']';
}
