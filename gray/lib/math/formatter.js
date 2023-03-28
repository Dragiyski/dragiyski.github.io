import { Vector, Matrix } from './index.js';

window.devtoolsFormatters ??= [];

const math_formatter = {
    header(object, config) {
        if (config?.internal) {
            return null;
        }
        for (let size = 2; size <= 4; ++size) {
            if (object instanceof Vector[size]) {
                return vectorHeader(object);
            }
        }
        for (let rows = 2; rows <= 4; ++rows) {
            for (let cols = 2; cols <= 4; ++cols) {
                if (object instanceof Matrix[rows][cols]) {
                    return matrixHeader(object);
                }
            }
        }
        return null;
    },
    hasBody(object) {
        for (let size = 2; size <= 4; ++size) {
            if (object instanceof Vector[size]) {
                return true;
            }
        }
        for (let rows = 2; rows <= 4; ++rows) {
            for (let cols = 2; cols <= 4; ++cols) {
                if (object instanceof Matrix[rows][cols]) {
                    return true;
                }
            }
        }
        return false;
    },
    body(object, config) {
        for (let size = 2; size <= 4; ++size) {
            if (object instanceof Vector[size]) {
                return vectorBody(object, config);
            }
        }

        for (let rows = 2; rows <= 4; ++rows) {
            for (let cols = 2; cols <= 4; ++cols) {
                if (object instanceof Matrix[rows][cols]) {
                    return matrixBody(object, config);
                }
            }
        }
    }
};

window.devtoolsFormatters.push(math_formatter);

function vectorHeader(object) {
    return [
        'span', {},
        [
            'span', { style: 'color: var(--color-text-secondary);' }, object.constructor.name
        ], ' ',
        [
            'span', { style: 'white-space: nowrap;' },
            '[', ...formatNumberList(...object), ']'
        ]
    ];
}

function matrixHeader(object) {
    return [
        'span', {},
        [
            'span', { style: 'color: var(--color-text-secondary);' }, object.constructor.name
        ], ' ',
        [
            'span', { style: 'white-space: nowrap;' },
            '[', ...object.rows.map(formatRow).flat(), ']'
        ]
    ];

    function formatRow(vector) {
        return ['[', ...formatNumberList(...vector), ']'];
    }
}

function vectorBody(object) {
    return [
        'div', {}, [
            'table', {
                style: 'border-collapse: collapse;'
            },
            [
                'tr', {},
                ...[...object].map(cell)
            ]
        ],
        ['object', { object, config: { internal: true } }]
    ];
}

function cell(value) {
    return ['td', { style: 'padding: 0.4em; border: 1px solid rgba(0, 0, 0, 0.1); color: var(--color-syntax-3);' }, value.toString()];
}

function matrixBody(object) {
    return [
        'div', {}, [
            'table', {
                style: 'border-collapse: collapse;'
            },
            ...object.rows.map(row)
        ],
        ['object', { object, config: { internal: true } }]
    ];

    function row(vector) {
        return [
            'tr', {},
            ...[...vector].map(cell)
        ];
    }
}

function formatNumberList(...items) {
    const children = [];
    items.forEach(item => {
        children.push(formatNumber(item), ', ');
    });
    if (children.length > 0) {
        children.pop();
    }
    return children;
}

function formatNumber(value) {
    return [
        'span', {
            style: 'color: var(--color-syntax-3);'
        },
        value.toString()
    ];
}
