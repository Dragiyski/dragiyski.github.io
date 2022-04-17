import { getTextRepresentation } from './database.js';
import { parseActiveItems } from './tunic-inline.js';

customElements.whenDefined('tunic-inline').then(() => {
    document.addEventListener('keydown', onKeyDown);
});

if (document.readyState !== 'complete') {
    const onReadyStateChange = function (event) {
        if (document.readyState !== 'loading') {
            document.removeEventListener('readystatechange', onReadyStateChange);
            window.removeEventListener('load', onReadyStateChange);
            nextMicrotask(whenLoaded);
        }
    };
    document.addEventListener('readystatechange', onReadyStateChange, { passive: true });
    window.addEventListener('load', onReadyStateChange, { once: true, passive: true });
} else {
    nextMicrotask(whenLoaded);
}

function nextMicrotask(callback) {
    const promise = (async () => {
        await callback();
    })();
    promise.then(() => {}, error => void console.error(error));
}

const functionKeys = [];
for (let i = 1; i <= 12; ++i) {
    functionKeys.push(`F${i}`);
}

functionKeys.push('Tab');

/**
 * @param {KeyboardEvent} event
 */
function onKeyDown(event) {
    const tunicText = document.getElementById('tunic-text');
    const phoneticText = document.getElementById('phonetic-text');
    const tunicProvisional = document.getElementById('tunic-provision-symbol');
    const phoneticProvisional = document.getElementById('tunic-provision-phoneme');
    const functionIndex = functionKeys.indexOf(event.key);
    if (functionIndex >= 0) {
        if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) {
            return;
        }
        event.preventDefault();
        const element = document.getElementById('tunic-provision-symbol');
        if (element == null) {
            return;
        }
        const active = parseActiveItems(element.dataset.tunicItems);
        const desiredIndex = active.indexOf(functionIndex);
        if (desiredIndex >= 0) {
            active.splice(desiredIndex, 1);
        } else {
            active.push(functionIndex);
            active.sort((a, b) => a - b);
        }
        element.dataset.tunicItems = active.join(' ');
    } else if (event.key === 'Enter') {
        if (event.metaKey || event.altKey || event.ctrlKey) {
            return;
        }
        event.preventDefault();
        if (event.shiftKey) {
            tunicText.insertBefore(document.createElement('br'), tunicProvisional);
            phoneticText.insertBefore(document.createElement('br'), phoneticProvisional);
        } else if (tunicProvisional.activeItems.length > 0) {
            const tunicSymbol = tunicProvisional.cloneNode(false);
            tunicSymbol.removeAttribute('id');
            tunicSymbol.classList.remove('provisional');
            const phoneticSymbol = phoneticProvisional.cloneNode(true);
            phoneticSymbol.removeAttribute('id');
            phoneticSymbol.classList.remove('provisional');
            tunicText.insertBefore(tunicSymbol, tunicProvisional);
            phoneticText.insertBefore(phoneticSymbol, phoneticProvisional);
            tunicProvisional.dataset.tunicItems = '';
        }
    } else if (event.key === 'Escape') {
        event.preventDefault();
        tunicProvisional.dataset.tunicItems = '';
    } else if (event.key === 'Backspace') {
        event.preventDefault();
        if (!event.ctrlKey) {
            const symbol = tunicProvisional.previousElementSibling;
            if (symbol != null) {
                symbol.parentElement.removeChild(symbol);
            }
            const phoneme = phoneticProvisional.previousElementSibling;
            if (phoneme != null) {
                phoneme.parentElement.removeChild(phoneme);
            }
        }
    } else if (event.key.length === 1 && /^\P{C}$/u.test(event.key)) {
        if (event.metaKey || event.altKey || event.ctrlKey) {
            return;
        }
        event.preventDefault();
        const text = event.key.toUpperCase();
        {
            const span = document.createElement('span');
            span.className = 'character english';
            span.textContent = text;
            tunicText.insertBefore(span, tunicProvisional);
        }
        {
            const span = document.createElement('span');
            span.className = 'character english';
            span.textContent = text;
            phoneticText.insertBefore(span, phoneticProvisional);
        }
    }
}

function whenLoaded() {
    const provisionalSymbol = document.getElementById('tunic-provision-symbol');
    const provisionalPhoneme = document.getElementById('tunic-provision-phoneme');
    provisionalSymbol.addEventListener('tunic-item-update', onUpdate);
    function onUpdate() {
        const active = provisionalSymbol.activeItems;
        const text = getTextRepresentation(active);
        if (text) {
            provisionalPhoneme.textContent = text;
        } else {
            provisionalPhoneme.innerHTML = '&nbsp;';
        }
    }
}
