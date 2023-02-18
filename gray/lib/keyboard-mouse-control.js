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
        down: keyboardMovementAction('positive', 0, 1),
        up: keyboardMovementAction('positive', 0, 0),
        state: false
    },
    up: {
        name: 'Move Up',
        code: 'KeyQ',
        down: keyboardMovementAction('positive', 1, 1),
        up: keyboardMovementAction('positive', 1, 0),
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

function keyboardMovementAction(type, dimension, value) {
    return function () {
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
    constructor(deltaYaw, deltaPitch) {
        super('control.mouse.move');
        Object.defineProperties(this, {
            deltaYaw: {
                configurable: true,
                value: deltaYaw
            },
            deltaPitch: {
                configurable: true,
                value: deltaPitch
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
    if (document.pointerLockElement == null) {
        return;
    }
    const width = screen.width;
    const height = screen.height;
    const diagonal = Math.sqrt(width * width + height * height);
    const deltaYaw = (event.movementX / diagonal) * Math.PI * 2;
    const deltaPitch = (event.movementY / diagonal) * Math.PI * 2;

    const nextEvent = new MouseMoveControlEvent(deltaYaw, deltaPitch);
    document.pointerLockElement.dispatchEvent(nextEvent);
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
