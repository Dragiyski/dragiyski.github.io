const keyboard = Object.assign(Object.create(null), {
    forward: {
        name: 'Move Forward',
        code: 'KeyW',
        down: keyboardMovementAction('positive', 2, 1),
        up: keyboardMovementAction('positive', 2, 0),
        state: false
    },
    backward: {
        name: 'Move Backward',
        code: 'KeyS',
        down: keyboardMovementAction('negative', 2, 1),
        up: keyboardMovementAction('negative', 2, 0),
        state: false
    },
    left: {
        name: 'Move Left',
        code: 'KeyA',
        down: keyboardMovementAction('negative', 0, 1),
        up: keyboardMovementAction('negative', 0, 0),
        state: false
    },
    right: {
        name: 'Move Right',
        code: 'KeyD',
        down: keyboardMovementAction('negative', 0, 1),
        up: keyboardMovementAction('negative', 0, 0),
        state: false
    },
    up: {
        name: 'Move Up',
        code: 'KeyQ',
        down: keyboardMovementAction('negative', 1, 1),
        up: keyboardMovementAction('negative', 1, 0),
        state: false
    },
    down: {
        name: 'Move Down',
        code: 'KeyE',
        down: keyboardMovementAction('negative', 1, 1),
        up: keyboardMovementAction('negative', 1, 0),
        state: false
    }
});

const movement = {
    positive: [0, 0, 0],
    negative: [0, 0, 0]
};

const rotation = {
    yaw: 0.0,
    pitch: 0.0
};

export let screen_active = true;

let mouse_speed_x = 0.5;
let mouse_speed_y = 0.5;

export const mouse_speed = Object.create(null, {
    x: {
        get() {
            return mouse_speed_x;
        },
        set(value) {
            if (isFinite(value) && value > 0) {
                mouse_speed_x = value;
            }
        }
    },
    y: {
        get() {
            return mouse_speed_y;
        },
        set(value) {
            if (isFinite(value) && value > 0) {
                mouse_speed_y = value;
            }
        }
    }
});

export function pause() {
    screen_active = false;
}

export function resume() {
    screen_active = true;
}

function keyboardMovementAction(type, dimension, value) {
    return function () {
        if (!screen_active) {
            return;
        }
        if (document.pointerLockElement == null) {
            return;
        }
        movement[type][dimension] = value;
        const event = new KeyboardMoveControlEvent(movement.positive, movement.negative);
        document.pointerLockElement.dispatchEvent(event);
    };
}

export class ControlEvent extends Event {
}

class MouseMoveControlEvent extends ControlEvent {
    constructor(yaw, pitch) {
        super('control.mouse.move');
        Object.defineProperties(this, {
            yaw: {
                configurable: true,
                value: yaw
            },
            pitch: {
                configurable: true,
                value: pitch
            }
        });
    }
}

class KeyboardMoveControlEvent extends ControlEvent {
    constructor(positive, negative) {
        super('control.keyboard.move');
        Object.defineProperties(this, {
            positive: {
                configurable: true,
                value: [...positive]
            },
            negative: {
                configurable: true,
                value: [...negative]
            }
        });
    }
}

/**
 * @param {KeyboardEvent} event
 */
function onKeyDown(event) {
    if (event.isComposing || event.keyCode === 229) {
        return;
    }
    for (const name in keyboard) {
        const action = keyboard[name];
        if (action.code === event.code && !action.state) {
            action.state = true;
            const callee = action.down;
            if (typeof callee === 'function') {
                event.preventDefault();
                callee();
            }
        }
    }
}

/**
 * @param {KeyboardEvent} event
 */
function onKeyUp(event) {
    if (event.isComposing || event.keyCode === 229) {
        return;
    }
    for (const name in keyboard) {
        const action = keyboard[name];
        if (action.code === event.code && action.state) {
            const callee = action.up;
            action.state = false;
            if (typeof callee === 'function') {
                event.preventDefault();
                callee();
            }
        }
    }
}

function onMouseMove(event) {
    if (!screen_active) {
        return;
    }
    if (document.pointerLockElement == null) {
        return;
    }
    const width = screen.width;
    const height = screen.height;
    const diagonal = Math.sqrt(width * width + height * height);
    const yawChange = (event.movementX / diagonal) * mouse_speed_x * Math.PI * 2;
    const pitchChange = (event.movementY / diagonal) * mouse_speed_y * Math.PI * 2;
    rotation.yaw = (Math.PI * 2 + rotation.yaw + yawChange) % (Math.PI * 2);
    rotation.pitch = Math.max(-Math.PI * 0.5, Math.min(Math.PI * 0.5, rotation.pitch - pitchChange));
    {
        const event = new MouseMoveControlEvent(rotation.yaw, rotation.pitch);
        document.pointerLockElement.dispatchEvent(event);
    }
}

function main() {
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    document.addEventListener('mousemove', onMouseMove);
}

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
    main();
}
