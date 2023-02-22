async function do_preprocess(source, context) {
    const sourceIndex = context.files.length;
    context.files.push(context.file);
    const file = context.file;
    source = source.split(/(?:\r?\n|\r)/mg);
    const target = [
        `#line 1 ${sourceIndex}`
    ];
    for (let i = 0; i < source.length; ++i) {
        const line = source[i];
        if (/^\s*#/.test(line)) {
            let text = line.trim();
            const directive = text.split(/\s+/, 1)[0];
            if (directive === '#import') {
                let sourceName, targetName, keyword;
                text = text.substring(directive.length).trim();
                const type = text.split(/\s+/, 1)[0];
                if (['bool', 'int', 'float', 'define', 'expression'].indexOf(type) < 0) {
                    throw new ParseError(file, i + 1, 'Directive #import: unsupported type, expected one of ["bool", "int", "float", "expression"]');
                }
                text = text.substring(type.length).trim();
                if (text.startsWith('"')) {
                    const quoted = text.split('"');
                    let name = [quoted[0], quoted[1]];
                    let end = false;
                    for (let k = 2; k < quoted.length; ++k) {
                        name.push(quoted[k]);
                        if (quoted[k - 1].endsWith('\\')) {
                            continue;
                        }
                        end = true;
                        break;
                    }
                    if (!end) {
                        throw new ParseError(file, i + 1, 'Directive #import: mismatched quotes for the "name" argument');
                    }
                    name.pop();
                    name.push('');
                    name = name.join('"');
                    text = text.substring(name.length).trim();
                    sourceName = JSON.parse(name);
                } else {
                    sourceName = text.split(/\s+/, 1)[0];
                    text = text.substring(sourceName.length).trim();
                }
                keyword = text.split(/\s+/, 1)[0];
                if (keyword === 'as') {
                    text = text.substring(keyword.length).trim();
                    targetName = text.split(/\s+/, 1)[0];
                    if (!/^[a-zA-Z_][a_zA-Z0-9_]*$/.test(targetName) || reserved_macro_words.indexOf(targetName) >= 0) {
                        throw new ParseError(file, i + 1, 'Directive #import: invalid target name');
                    }
                    text = text.substring(targetName.length).trim();
                    keyword = text.split(/\s+/, 1)[0];
                }
                if (keyword !== 'from') {
                    throw new ParseError(file, i + 1, 'Directive #import: invalid format, expected #import <type> <name> [as <target>] from "<url>"');
                }
                text = text.substring(keyword.length).trim();
                if (!text.startsWith('"')) {
                    throw new ParseError(file, i + 1, 'Directive #import: invalid format, expected #import <type> <name> [as <target>] from "<url>"');
                }
                let targetUrl = JSON.parse(text);
                targetUrl = new URL(targetUrl, context.file);
                const module = await import(targetUrl);
                const value = module[sourceName];
                let code = null;
                if (type === 'int') {
                    if (!Number.isSafeInteger(value)) {
                        throw new ParseError(file, i + 1, `Directive #import: expected type "int", but value is not an integer or not exported`);
                    }
                    code = `#define ${targetName} ${value.toString(10)}`;
                } else if (type === 'float') {
                    if (!isFinite(value)) {
                        throw new ParseError(file, i + 1, `Directive #import: expected type "float", but value is not a finite number`);
                    }
                    code = `#define ${targetName} ${value.toString()}`;
                } else if (type === 'bool') {
                    if (value) {
                        code = `#define ${targetName} 1`;
                    } else {
                        code = `#define ${targetName} 0`;
                    }
                } else if (type === 'define') {
                    if (value) {
                        code = `#define ${targetName}`;
                    }
                } else if (type === 'expression') {
                    if (typeof value === 'string') {
                        throw new ParseError(file, i + 1, `Directive #import: expected type "expression", but value is not a string`);
                    }
                    let v = value.split(/(?:\r?\n|\r)/mg);
                    for (let n = 0; n < v.length - 1; ++n) {
                        if (!v.endsWith('\\')) {
                            v[n] = `v[n]\\`;
                        }
                    }
                    v = v.join('\n');
                    code = `#define ${targetName} ${v}`;
                }
                if (code != null) {
                    target.push(code);
                } else {
                    target.push('');
                }
                continue;
            }
        }
        target.push(line);
    }
    return target.join('\n');
}

const reserved_macro_words = [
    'defined',
    'and',
    'and_eq',
    'bitand',
    'bitor',
    'compl',
    'not',
    'not_eq',
    'or',
    'or_eq',
    'xor',
    'xor_eq'
]

async function do_load(context) {
    const response = await fetch(context.file);
    const source = await response.text();
    return do_preprocess(source, context);
}

export async function load(url) {
    const context = Object.create(null);
    context.files = [];
    context.file = url;
    return do_load(context);
}

export class ParseError extends Error {
    constructor(file, line, message) {
        const errorMessage = `${file}:${line} ${message}`;
        super(errorMessage);
        this.message = errorMessage;
        this.file = file;
        this.line = line;
    }
};
