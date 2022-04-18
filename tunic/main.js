import { getTextRepresentation, vowels, consonants } from './database.js';
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
        if (event.shiftKey || event.ctrlKey) {
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
        const text = event.key;
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

function handleVoiceChanged(event) {
    let voices = speechSynthesis.getVoices();
    voices = [...voices];
    if (voices.length <= 0) {
        return;
    }
    voices = [...voices].filter(voice => voice?.lang?.startsWith?.('en-'));
    if (voices.length <= 0) {
        return;
    }
    const voiceUnavailable = document.getElementById('help-example-voice-unavailable');
    const voiceList = document.getElementById('help-example-voice');
    let initializeSpeech = false;
    if (voiceUnavailable != null && voiceUnavailable.parentElement === voiceList) {
        initializeSpeech = true;
        voiceList.removeChild(voiceUnavailable);
    }
    const options = [...voiceList.options].filter(option => option !== voiceUnavailable);
    const selectedOption = voiceList.options.selectedIndex >= 0 ? options[voiceList.options.selectedIndex] : null;
    while (voiceList.childNodes.length > 0) {
        voiceList.removeChild(voiceList.childNodes.item(0));
    }
    let defaultOption = null;
    for (const voice of voices) {
        const optionIndex = options.findIndex(option => option.value === voice.voiceURI);
        if (optionIndex <= 0) {
            const option = document.createElement('option');
            option.setAttribute('value', voice.voiceURI);
            option.voice = voice;
            option.textContent = voice.voiceURI;
            voiceList.appendChild(option);
            if (voice.default) {
                defaultOption = option;
            }
        } else {
            const option = options[optionIndex];
            options.splice(optionIndex, 1);
            option.voice = voice;
            voiceList.appendChild(option);
        }
    }
    if (initializeSpeech) {
        for (const textContainer of document.querySelectorAll('.help-example-english-word.text')) {
            const button = document.createElement('button');
            button.setAttribute('type', 'button');
            button.className = 'help-example-speak-button help-example-english-word button-speak';
            button.addEventListener('click', speakSelf);
            button.innerHTML = textContainer.innerHTML;
            textContainer.parentElement.replaceChild(button, textContainer);
        }
    }
}

function whenLoaded() {
    const provisionalSymbol = document.getElementById('tunic-provision-symbol');
    const provisionalPhoneme = document.getElementById('tunic-provision-phoneme');
    const tunicMouseControl = document.getElementById('tunic-mouse-control');
    provisionalSymbol.addEventListener('tunic-item-update', onUpdate);
    function onUpdate() {
        const active = provisionalSymbol.activeItems;
        const text = getTextRepresentation(active);
        if (text) {
            provisionalPhoneme.textContent = text;
        } else {
            provisionalPhoneme.innerHTML = '&nbsp;';
        }
        if (!provisionalSymbol.inControlUpdate) {
            tunicMouseControl.setActive(provisionalSymbol.dataset.tunicItems);
        }
    }
    let voicingAvaliable = false;
    if (
        window.speechSynthesis != null &&
        typeof speechSynthesis.speak === 'function' &&
        typeof speechSynthesis.getVoices === 'function' &&
        typeof window.SpeechSynthesisUtterance === 'function'
    ) {
        let voices = speechSynthesis.getVoices();
        if (typeof voices?.[Symbol.iterator] === 'function') {
            voices = [...voices];
            if (voices.length <= 0) {
                speechSynthesis.addEventListener('voiceschanged', handleVoiceChanged);
            }
            voices = [...voices].filter(voice => voice?.lang?.startsWith?.('en-'));
            if (voices.length > 0) {
                const voiceUnavailable = document.getElementById('help-example-voice-unavailable');
                const voiceList = document.getElementById('help-example-voice');
                voiceList.removeChild(voiceUnavailable);
                for (const voice of voices) {
                    const option = document.createElement('option');
                    option.setAttribute('value', voice.voiceURI);
                    option.voice = voice;
                    option.textContent = voice.voiceURI;
                    voiceList.appendChild(option);
                    if (voice.default) {
                        option.setAttribute('selected', 'selected');
                    }
                }
                voicingAvaliable = true;
            }
        }
    }

    tunicMouseControl.addEventListener('tunic-element-update', onElementUpdate);

    const vowelList = document.getElementById('help-example-vowel-list');
    const consonantList = document.getElementById('help-example-consonant-list');

    for (const [list, phonemes] of [[vowelList, vowels], [consonantList, consonants]]) {
        for (const phoneme in phonemes) {
            const items = phonemes[phoneme];
            const li = document.createElement('li');
            const tunic = document.createElement('span', { is: 'tunic-inline' });
            const link = document.createElement('a');
            link.setAttribute('href', 'javascript:void(0);');
            link.addEventListener('click', setToElement);
            link.dataset.tunicItems = items.join(' ');
            li.appendChild(link);
            tunic.classList.add('help-example-symbol-tunic');
            tunic.dataset.tunicItems = items.join(' ');
            link.appendChild(tunic);
            const examples = items.examples;
            const ipa = document.createElement('span');
            ipa.classList.add('help-example-symbol-ipa');
            ipa.textContent = phoneme;
            link.appendChild(ipa);
            if (Array.isArray(examples) && examples.length > 0) {
                const elements = [];
                for (const example of examples) {
                    let element;
                    if (voicingAvaliable) {
                        element = document.createElement('button');
                        element.setAttribute('type', 'button');
                        element.className = 'help-example-speak-button help-example-english-word button-speak';
                        element.addEventListener('click', speakSelf);
                    } else {
                        element = document.createElement('span');
                        element.className = 'help-example-english-word text'
                    }
                    element.innerHTML = example;
                    elements.push(element);
                }
                li.appendChild(document.createTextNode(' like in '));
                li.appendChild(elements[0]);
                for (let i = 1; i < elements.length - 1; ++i) {
                    li.appendChild(document.createTextNode(', '));
                    li.appendChild(elements[i]);
                }
                if (elements.length > 1) {
                    li.appendChild(document.createTextNode(', or '));
                    li.appendChild(elements[elements.length - 1]);
                }
            }
            list.appendChild(li);
        }
    }
}

/**
 * @param {Event} event 
 */
function speakSelf(event) {
    const target = event.currentTarget;
    if (speechSynthesis.speaking || speechSynthesis.pending || speechSynthesis.pending) {
        speechSynthesis.cancel();
    }
    const word = target.textContent;
    const utterance = new SpeechSynthesisUtterance(word);
    const voiceList = document.getElementById('help-example-voice');
    const options = voiceList.options;
    const option = options[options.selectedIndex];
    if (option != null) {
        if (option.voice != null && typeof option.voice.voiceURI === 'string') {
            utterance.voice = option.voice;
        } else {
            const voiceURI = option.value;
            const voice = [...speechSynthesis.getVoices()].filter(voice => voice.voiceURI === voiceURI)[0];
            if (voice != null) {
                utterance.voice = voice;
            }
        }
    }
    if (utterance.voice != null) {
        speechSynthesis.speak(utterance);
    }
}

function onElementUpdate(event) {
    const provision = document.getElementById('tunic-provision-symbol');
    const active = parseActiveItems(provision.dataset.tunicItems);
    if (event.active && active.indexOf(event.index) < 0) {
        active.push(event.index);
    } else if (!event.active) {
        const index = active.indexOf(event.index);
        if (index >= 0) {
            active.splice(index, 1);
        }
    }
    active.sort((a, b) => a - b);
    provision.dataset.tunicItems = active.join(' ');
}

function setToElement(event) {
    const target = event.currentTarget;
    const items = parseActiveItems(target.dataset.tunicItems);
    const provision = document.getElementById('tunic-provision-symbol');
    let min = items.reduce((n, v) => v < n ? v : n, 12);
    if (min <= 5) {
        min = 0;
    } else {
        min = 6;
    }
    let max = min === 0 ? 5 : 11;
    let activeItems = parseActiveItems(provision.dataset.tunicItems);
    activeItems = activeItems.filter(n => n < min || n > max).concat(items);
    activeItems.sort((a, b) => a - b);
    provision.dataset.tunicItems = activeItems.join(' ');
}