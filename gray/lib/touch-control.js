import { Vector2D, add, div, length, limits, mul, normalize, sub } from './math/index.js';

if ('ontouchstart' in window && navigator.maxTouchPoints > 0) {
    setupTouchControl();
}

const stylesheet = new URL('touch-control.css', import.meta.url);
const joystickResize = new ResizeObserver(onJoystickResize);
const controlType = {
    'left-joystick': 'joystick-move',
    'right-joystick': 'joystick-rotate'
};

function setupTouchControl() {
    if (document.readyState !== 'complete') {
        window.addEventListener('load', onFirstLoadedEvent);
        document.addEventListener('readystatechange', onDocumentStateChangeEvent);
    } else {
        main();
    }

    function onDocumentStateChangeEvent() {
        if (document.readyState === 'complete') {
            onFirstLoadedEvent();
        }
    }

    function onFirstLoadedEvent() {
        window.removeEventListener('load', onFirstLoadedEvent);
        document.removeEventListener('readystatechange', onDocumentStateChangeEvent);
        main().catch(error => {
            console.error(error);
        });
    }
}

async function main() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = stylesheet;
    document.head.appendChild(link);
    const leftJoystick = document.createElement('div');
    leftJoystick.className = 'joystick-container left';
    leftJoystick.id = 'left-joystick';
    const rightJoystick = document.createElement('div');
    rightJoystick.className = 'joystick-container right';
    rightJoystick.id = 'right-joystick';
    for (const joystick of [leftJoystick, rightJoystick]) {
        const stick = document.createElement('div');
        stick.className = 'stick';
        joystick.appendChild(stick);
        joystickResize.observe(joystick, {
            box: 'border-box'
        });
        joystick.position = new Vector2D(0, 0);
        joystick.touchMap = new Map();
    }
    document.body.appendChild(leftJoystick);
    document.body.appendChild(rightJoystick);
    window.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
}

function updateJoystick(joystick) {
    const stick = joystick.getElementsByClassName('stick').item(0);
    const position = add(mul(joystick.position, 0.5), 0.5);
    const c_width = joystick.clientWidth - stick.clientWidth;
    const c_height = joystick.clientHeight - stick.clientHeight;
    stick.style.left = CSS.px(position.x * c_width);
    stick.style.top = CSS.px(position.y * c_height);
}

/**
 * @param {Array<ResizeObserverEntry>} entries
 * @param {ResizeObserver} observer
 */
function onJoystickResize(entries, observer) {
    for (const entry of entries) {
        updateJoystick(entry.target);
    }
}

function onTouchStart(event) {
    for (const id of ['left-joystick', 'right-joystick']) {
        const joystick = document.getElementById(id);
        if (event.target === joystick || (joystick.compareDocumentPosition(event.target) & Node.DOCUMENT_POSITION_CONTAINED_BY)) {
            for (const touch of event.changedTouches) {
                event.preventDefault();
                joystick.touchMap.set(touch.identifier, new Vector2D(touch.screenX, touch.screenY));
            }
        }
    }
}

function onTouchEnd(event) {
    for (const id of ['left-joystick', 'right-joystick']) {
        const joystick = document.getElementById(id);
        for (const touch of event.changedTouches) {
            if (joystick.touchMap.has(touch.identifier)) {
                event.preventDefault();
                joystick.touchMap.delete(touch.identifier);
                if (joystick.touchMap.size === 0) {
                    joystick.position = new Vector2D(0, 0);
                    updateJoystick(joystick);
                    const nextEvent = new JoystickEvent(controlType[id], joystick.position);
                    window.dispatchEvent(nextEvent);
                }
            }
        }
    }
}

function onTouchMove(event) {
    for (const id of ['left-joystick', 'right-joystick']) {
        const joystick = document.getElementById(id);
        const stick = joystick.getElementsByClassName('stick').item(0);
        for (const touch of event.changedTouches) {
            if (joystick.touchMap.has(touch.identifier)) {
                event.preventDefault();
                const bb = joystick.getBoundingClientRect();
                const js = (joystick.clientHeight - stick.clientHeight) * 0.5;
                const jtl = new Vector2D(bb.x, bb.y);
                const jts = new Vector2D(bb.width, bb.height);
                const startPosition = add(jtl, mul(jts, 0.5));
                const currentPosition = new Vector2D(touch.clientX, touch.clientY);
                const joystickVector = sub(currentPosition, startPosition);
                const joystickVectorLength = length(joystickVector);
                let position;
                if (limits.float32.isEqual(joystickVectorLength, 0)) {
                    position = new Vector2D(0, 0);
                } else {
                    position = div(joystickVector, joystickVectorLength);
                    if (joystickVectorLength < js) {
                        position = mul(joystickVectorLength / js, position);
                    }
                }
                joystick.position = position;
                updateJoystick(joystick);
                const nextEvent = new JoystickEvent(controlType[id], joystick.position);
                window.dispatchEvent(nextEvent);
            }
        }
    }
}

class JoystickEvent extends Event {
    constructor(type, position) {
        super(type, {
            cancelable: false,
            bubbles: false,
            composed: false
        });
        Object.defineProperty(this, 'position', {
            value: position
        });
    }
}
