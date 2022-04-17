class CursorElement extends HTMLElement {
    #shadow;
    #span;
    #stateList;
    #state;
    #timer;
    constructor() {
        super();
        this.#stateList = [
            {
                duration: 800,
                style: {
                    backgroundColor: 'black'
                }
            },
            {
                duration: 800,
                style: {
                    backgroundColor: 'transparent'
                }
            }
        ];
        this.#shadow = this.attachShadow({ mode: 'closed' });
        const span = this.#span = this.ownerDocument.createElement('span');
        span.style.display = 'inline-block';
        span.style.width = '1px';
        span.style.height = '1.2em';
        span.style.backgroundColor = 'black';
        span.style.verticalAlign = 'middle';
        this.#state = 0;
        this.#shadow.appendChild(span);
    }

    connectedCallback() {
        if (this.#timer == null) {
            this.#schedule();
        }
    }

    disconnectedCallback() {
        if (this.#timer != null) {
            clearTimeout(this.#timer);
        }
    }

    #schedule() {
        this.#timer = setTimeout(() => void this.#nextState(), this.#stateList[this.#state].duration);
    }

    #nextState() {
        this.#timer = null;
        this.#state = (this.#state + 1) % this.#stateList.length;
        const state = this.#stateList[this.#state];
        for (const name in state.style ?? {}) {
            this.#span.style[name] = state.style[name];
        }
        this.#schedule();
    }
}

customElements.define('tunic-cursor', CursorElement);
