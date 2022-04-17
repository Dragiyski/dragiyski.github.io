import { points, lineElement, circleElement } from './tunic-symbol.js';

export class TunicInlineElement extends HTMLSpanElement {
    #shadow;
    #canvas;
    #context;
    #style;
    #div;
    #active;
    #elements = [];
    static #resizeObserver;
    static #attributeObserver;

    static {
        this.#resizeObserver = new ResizeObserver(this.#onResize);
        this.#attributeObserver = new MutationObserver(this.#onAttributeChange);
    }

    constructor() {
        super();
        this.#shadow = this.attachShadow({ mode: 'closed' });
        const canvas = this.#canvas = this.ownerDocument.createElement('canvas');
        const context = this.#context = canvas.getContext('2d');
        this.#shadow.appendChild(canvas);
        canvas.setAttribute('part', 'canvas');
        for (let index = 0; index < 12; ++index) {
            const element = Object.assign(Object.create(null), {
                canvas, context, index, ...lineElement
            });
            Object.defineProperties(element, {
                style: {
                    configurable: true,
                    enumerable: true,
                    get: () => this.#style
                }
            });
            this.#elements[index] = element;
        }
        {
            const element = Object.assign(Object.create(null), {
                canvas, context, index: this.#elements.length, ...circleElement
            });

            Object.defineProperties(element, {
                style: {
                    configurable: true,
                    enumerable: true,
                    get: () => this.#style
                }
            });
            this.#elements.push(element);
        }
    }

    connectedCallback() {
        this.#updateStyle();
        this.#updateItems();
        this.#redraw();
        TunicInlineElement.#resizeObserver.observe(this);
        TunicInlineElement.#attributeObserver.observe(this, {
            attributes: true,
            attributeFilter: ['data-tunic-items']
        });
    }

    disconnectedCallback() {
        TunicInlineElement.#resizeObserver.unobserve(this);
    }

    #updateStyle() {
        this.#style = null;
        const styleMap = this.computedStyleMap();
        const fontSize = styleMap.get('font-size').to('px').value;
        const desiredAspect = 400 / 600;
        const height = fontSize;
        const width = desiredAspect * height;
        const canvas = this.#canvas;
        canvas.attributeStyleMap.set('width', CSS.px(width));
        canvas.attributeStyleMap.set('height', CSS.px(height));
        canvas.width = width;
        canvas.height = height;
        let lineWidth = (3 / 100) * height;
        try {
            const unitValue = CSSUnitValue.parse(this.attributeStyleMap.get('--line-width')[0]);
            let value = unitValue.value;
            if (unitValue.unit === 'em') {
                value = value * styleMap.get('font-size').to('px');
            } else if (unitValue.unit === 'percent') {
                value = (value / 100) * innerHeight;
            } else if (unitValue.unit === 'pt') {
                value = value * CSS.in(1 / 72).to('px').value;
            } else {
                value = unitValue.to('px').value;
            }
            lineWidth = value;
        } catch {}
        let circleRadius = 2 * lineWidth;
        try {
            const unitValue = CSSUnitValue.parse(this.attributeStyleMap.get('--circle-radius')[0]);
            let value = unitValue.value;
            if (unitValue.unit === 'em') {
                value = value * styleMap.get('font-size').to('px');
            } else if (unitValue.unit === 'percent') {
                value = (value / 100) * innerHeight;
            } else if (unitValue.unit === 'pt') {
                value = value * CSS.in(1 / 72).to('px').value;
            } else {
                value = unitValue.to('px').value;
            }
            circleRadius = value;
        } catch {}
        const drawWidth = width - 2 * lineWidth;
        const drawHeight = height - 4 * lineWidth - circleRadius;
        this.attributeStyleMap.set('width', CSS.px(drawWidth));
        const dx = drawWidth / 2;
        const dy = drawHeight / 5;
        const gx = [lineWidth];
        const gy = [lineWidth];
        for (let i = 1; i < 3; ++i) {
            gx[i] = gx[i - 1] + dx;
        }
        for (let i = 1; i < 6; ++i) {
            gy[i] = gy[i - 1] + dy;
        }
        gy.splice(3, 0, (gy[gy.length - 1] + gy[0]) / 2);
        this.#style = Object.assign(Object.create(null), {
            lineWidth,
            circleRadius,
            gx,
            gy
        });
    }

    get activeItems() {
        return this.#active != null ? [...this.#active] : [];
    }

    #updateItems() {
        this.#active = null;
        const items = this.dataset.tunicItems;
        this.#active = parseActiveItems(items);
        const event = new Event('tunic-item-update');
        this.dispatchEvent(event);
    }

    #redraw() {
        const canvas = this.#canvas;
        const context = this.#context;
        context.clearRect(0, 0, canvas.width, canvas.height);
        const style = this.#style;
        if (style == null) {
            return;
        }
        const active = this.#active;
        if (active == null) {
            return;
        }
        const gx = style.gx;
        const gy = style.gy;
        context.lineWidth = style.lineWidth;
        context.lineJoin = 'round';
        context.lineCap = 'round';
        context.setLineDash([]);
        context.strokeStyle = '#000';
        const elements = this.#elements;
        for (const index of active) {
            elements[index].draw();
        }
        context.beginPath();
        context.moveTo(gx[points[4][0]], gy[points[4][1]]);
        context.lineTo(gx[points[6][0]], gy[points[6][1]]);
        context.closePath();
        context.stroke();
        // The vertical stroke goes to the center instead of the third line;
        // However, if not present, but the bottom vertical stroke is present, the side strokes joins the center, if present.
        if (active.indexOf(10) >= 0 && active.indexOf(7) < 0 && active.indexOf(6) >= 0 && active.indexOf(8) >= 0) {
            context.beginPath();
            context.moveTo(gx[points[5][0]], gy[points[5][1]]);
            context.lineTo(gx[points[3][0]], gy[points[3][1]]);
            context.closePath();
            context.stroke();
        }
    }

    #onResizeInner() {
        this.#updateStyle();
        this.#redraw();
    }

    static #onResize(entries, observer) {
        for (const entry of entries) {
            const target = entry.target;
            if (target instanceof TunicInlineElement) {
                target.#onResizeInner();
            }
        }
    }

    static #onAttributeChange(entries, observer) {
        for (const entry of entries) {
            const target = entry.target;
            if (target instanceof TunicInlineElement) {
                target.#updateItems();
                target.#redraw();
            }
        }
    }
}

export function parseActiveItems(items) {
    if (items == null) {
        return;
    }
    items = items.split(/,?\s+/);
    const active = [];
    for (const item of items) {
        if (!/^[0-9]+$/.test(item)) {
            continue;
        }
        const value = parseInt(item, 10);
        if (Number.isSafeInteger(value) && value >= 0 && value <= 12) {
            active.push(value);
        }
    }
    return active;
}

customElements.define('tunic-inline', TunicInlineElement, { extends: 'span' });
