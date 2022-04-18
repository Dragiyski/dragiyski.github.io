import { parseActiveItems } from './tunic-inline.js';
import { points, lineElement, circleElement, lines } from './tunic-symbol.js';

class TunicControlElement extends HTMLDivElement {
    #shadow;
    #canvas;
    #context;
    #style;
    #elements = [];
    #highlighted = null;
    #listeners = Object.create(null);
    #inUpdateView = 0;
    static #resizeObserver;

    static {
        this.#resizeObserver = new ResizeObserver(this.#onResize);
    }

    constructor() {
        super();
        this.#shadow = this.attachShadow({ mode: 'closed' });
        const canvas = this.#canvas = this.ownerDocument.createElement('canvas');
        const context = this.#context = canvas.getContext('2d');
        this.#shadow.appendChild(canvas);
        // canvas.setAttribute('part', 'canvas');
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
        this.#listeners.onMouseEnter = this.#onMouseEnter.bind(this);
        this.#listeners.onMouseMove = this.#onMouseMove.bind(this);
        this.#listeners.onMouseLeave = this.#onMouseLeave.bind(this);
        this.#listeners.onClick = this.#onClick.bind(this);
    }

    connectedCallback() {
        TunicControlElement.#resizeObserver.observe(this);
        this.#updateStyle();
        this.#redraw();
        this.#addEventListeners();
    }

    disconnectedCallback() {
        TunicControlElement.#resizeObserver.unobserve(this);
        this.#removeEventListeners();
    }

    #addEventListeners() {
        this.#canvas.addEventListener('mouseenter', this.#listeners.onMouseEnter, { passive: true });
        this.#canvas.addEventListener('click', this.#listeners.onClick, { passive: true });
    }

    #removeEventListeners() {
        this.#canvas.removeEventListener('mouseenter', this.#listeners.onMouseEnter);
        this.#canvas.removeEventListener('click', this.#listeners.onClick);
        this.#canvas.removeEventListener('mousemove', this.#listeners.onMouseMove);
        this.#canvas.removeEventListener('mouseleave', this.#listeners.onMouseLeave);
    }

    #onMouseEnter(event) {
        this.#canvas.addEventListener('mousemove', this.#listeners.onMouseMove, { passive: true });
        this.#canvas.addEventListener('mouseleave', this.#listeners.onMouseLeave, { passive: true });
        this.#updateHighlighted([event.offsetX, event.offsetY]);
        this.#redraw();
    }
    #onMouseMove(event) {
        this.#updateHighlighted([event.offsetX, event.offsetY]);
        this.#redraw();
    }
    #onMouseLeave(event) {
        this.#canvas.removeEventListener('mousemove', this.#listeners.onMouseMove);
        this.#canvas.removeEventListener('mouseleave', this.#listeners.onMouseLeave);
        this.#highlighted = null;
        this.#redraw();
    }
    #onClick(event) {
        this.#updateHighlighted([event.offsetX, event.offsetY]);
        if (this.#highlighted == null) {
            this.#redraw();
            return;
        }
        this.#highlighted.active = !this.#highlighted.active;
        this.#redraw();
        const updateEvent = new TunicElementUpdateEvent(this.#highlighted.index, this.#highlighted.active);
        this.dispatchEvent(updateEvent);
    }

    #updateHighlighted(point) {
        const canvas = this.#canvas;
        const context = this.#context;
        const style = this.#style;
        if (style == null) {
            return;
        }
        let circleDistance = this.#elements[12].distance(point, style.circleRadius + style.lineWidth);
        if (circleDistance != null) {
            this.#highlighted = this.#elements[12];
            return;
        }
        let selectedElement = null;
        let selectedDistance = Number.POSITIVE_INFINITY;
        for (let i = 0; i < 12; ++i) {
            const element = this.#elements[i];
            const distance = element.distance(point, style.lineWidth * 2);
            if (distance != null && distance < selectedDistance) {
                selectedDistance = distance;
                selectedElement = element;
            }
        }
        this.#highlighted = selectedElement;
    }

    #updateStyle() {
        ++this.#inUpdateView;
        try {
            this.#style = null;
            const styleMap = this.computedStyleMap();
            const width = this.clientWidth - styleMap.get('padding-left').to('px').value - styleMap.get('padding-right').to('px').value;
            const desiredAspect = 400 / 600;
            const height = width / desiredAspect;
            let cssHeight = height;
            if (styleMap.get('box-sizing').value === 'border-box') {
                cssHeight += styleMap.get('padding-top').to('px').value - styleMap.get('padding-bottom').to('px').value;
            }
            this.attributeStyleMap.set('height', CSS.px(cssHeight));
            const canvas = this.#canvas;
            canvas.width = width;
            canvas.height = height;
            canvas.attributeStyleMap.set('width', CSS.px(width));
            canvas.attributeStyleMap.set('height', CSS.px(height));
            let lineWidth = (1 / 100) * height;
            try {
                const unitValue = CSSUnitValue.parse(this.attributeStyleMap.get('--line-width')[0]);
                let value = unitValue.value;
                if (unitValue.unit === 'em') {
                    value = value * styleMap.get('font-size').to('px');
                } else if (unitValue.unit === 'percent') {
                    value = (value / 100) * height;
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
                gy,
                fontSize: styleMap.get('font-size').to('px').value
            });
        } finally {
            --this.#inUpdateView;
        }
    }

    #redraw() {
        const canvas = this.#canvas;
        const context = this.#context;
        context.clearRect(0, 0, canvas.width, canvas.height);
        const style = this.#style;
        if (style == null) {
            return;
        }
        context.lineWidth = style.lineWidth;
        context.lineJoin = 'round';
        context.lineCap = 'round';
        context.setLineDash([]);
        context.lineDashOffset = 0;
        context.strokeStyle = '#EEE';
        for (const element of this.#elements) {
            element.draw();
        }
        const { gx, gy } = style;
        context.strokeStyle = '#000';
        context.beginPath();
        context.moveTo(gx[points[4][0]], gy[points[4][1]]);
        context.lineTo(gx[points[6][0]], gy[points[6][1]]);
        context.closePath();
        context.stroke();
        for (const element of this.#elements) {
            if (element.active) {
                element.draw();
            }
        }
        context.setLineDash([context.lineWidth * 2, context.lineWidth * 5]);
        context.lineDashOffset = 0;
        context.lineWidth /= 2;
        if (this.#highlighted != null) {
            const element = this.#highlighted;
            if (element.active) {
                context.strokeStyle = '#FFF';
            } else {
                context.strokeStyle = '#000'
            }
            element.draw();
        }
        const axes = [gx, gy];
        for (let i = 0; i < 12; ++i) {
            const element = this.#elements[i];
            const data = lines[element.index].map(i => points[i].map((i, axis) => axes[axis][i]));
            const midpoint = [(data[0][0] + data[1][0]) / 2, (data[0][1] + data[1][1]) / 2];
            const text = `F${element.index + 1}`;
            context.font = `${style.fontSize}px serif`;
            const metrics = context.measureText(text);
            const x = Math.max(0, midpoint[0] - metrics.width / 2);
            context.fillStyle = 'rgba(255, 255, 255, 0.9)';
            context.fillRect(x - style.lineWidth, midpoint[1] - style.fontSize / 1.5, metrics.width + 2 * style.lineWidth, style.fontSize);
            context.fillStyle = '#000';
            context.fillText(text, x, midpoint[1]);
        }
        {
            const text = `Tab`;
            const midpoint = [gx[points[11][0]], gy[points[11][1]] + style.circleRadius];
            const metrics = context.measureText(text);
            context.font = `${style.fontSize}px serif`;
            context.fillStyle = 'rgba(255, 255, 255, 0.6)';
            const x = Math.max(0, midpoint[0] - metrics.width / 2);
            context.fillRect(x - style.lineWidth, midpoint[1], metrics.width + 2 * style.lineWidth, style.fontSize);
            context.fillStyle = '#000';
            context.fillText(text, x, midpoint[1] + style.fontSize / 1.5);
        }
    }

    static #onResize(entries, observer) {
        for (const entry of entries) {
            const target = entry.target;
            if (target instanceof TunicControlElement) {
                if (target.#inUpdateView <= 0) {
                    target.#inUpdateView = 1;
                    try {
                        target.#updateStyle();
                        target.#redraw();
                    } finally {
                        --target.#inUpdateView;
                    }
                }
            }
        }
    }

    setActive(active) {
        if (!Array.isArray(active)) {
            if (typeof active === 'string') {
                active = parseActiveItems(active);
            } else {
                return;
            }
        }
        for (let i = 0; i < this.#elements.length; ++i) {
            this.#elements[i].active = active.indexOf(i) >= 0;
        }
        this.#redraw();
    }
}

class TunicElementUpdateEvent extends Event {
    #index;
    #active;
    constructor(index, active, ...more) {
        super('tunic-element-update', ...more);
        this.#index = index;
        this.#active = active;
    }

    get index() {
        return this.#index;
    }

    get active() {
        return this.#active;
    }
}

customElements.define('tunic-control', TunicControlElement, { extends: 'div' });
