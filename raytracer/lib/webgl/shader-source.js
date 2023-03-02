/* Extended GLSL language for WebGL2:
 *
 * The language provide 2 additional directives: #import and #include
 *
 * The token processing:
 * When an element is quoted, it can contain any escape characters parsed by JSON.parse.
 * When a relative URL is quoted, it will be expanded relative to the file.
 * When a relative URL is angle-bracketed, it will be expanded relative to document.baseURI.
 *
 * #import directive is replaced by #define based on its arguments, the format is:
 * #import <type> <name> from <url>
 * #import <type> <name> as <target_name> from <url>
 * <type>: can be one of "bool", "int", "float", "if", "expression"
 * <name>: specify the imported name, can be quoted;
 * <target_name>: defined the target #define name, cannot be quoted and must be valid C++ macro name;
 * <url>: give the URL to a module, can be quoted or angle-bracketed;
 *
 * #import types expansion rules:
 * - bool: expands to `#define <target_name> 1` or `#define <target_name> 0` based on the javascript truth value of the imported variable. (If a name is not exported it will be false-y).
 * - int, float: expands to `#define <target_name> <value>` where <value> is decimal representation of int/float; If the value is not null, must be valid int or finite number respectively, otherwise #define result in ParseError.
 * - if: expands to `#define <target_name>` if the <value> is truthful, otherwise it generates empty line.
 * - expression: expands to `#define <target_name> <value>` requiring <value> to be a string. This allow modules to directly inject code (limited to single expression) into #define.
 *
 * The purpose of #import is to import dynamic definitions, usually by defining macros describing various GLSL support that can be checked by javascript.
 *
 * #include: Allow include another file onto the location the file is defined. The including file can be cascaded. The format is:
 * #include [once] <url>
 * "once" keyword won't include file if it is found in the source files, already.
 * <url> can be quoted or angle-bracketed, as described above.
 *
 * #include can appear anywhere, including within functions.
 * The "once" can be simulated by #ifndef, #define, #endif shield. However, once will be handled earlier, while #ifndef check will include the code and let
 * the WebGL compiler deal with the preprocessors' #ifndef. Therefore "once" produce smaller generated code.
 */

async function do_preprocess(source, { files = [], file, modulePath = [document.baseURI] } = {}) {
    const sourceIndex = files.length;
    files.push(file);
    source = source.split(/(?:\r?\n|\r)/mg);
    const target = [];
    if (sourceIndex === 0) {
        target.push('#version 300 es', '#line 2 0');
    } else {
        target.push(`#line 1 ${sourceIndex}`);
    }
    parseSource(source);
    for (let i = 0; i < source.length; ++i) {
        const line = source[i];
        if (/^\s*#/.test(line)) {
            let text = line.trim();
            const directive = text.split(/\s+/, 1)[0];
            if (directive === '#version') {
                if (sourceIndex > 0) {
                    target.push('');
                }
                continue;
            }
            if (directive === '#import') {
                let sourceName, targetName, keyword;
                text = text.substring(directive.length).trim();
                const type = text.split(/\s+/, 1)[0];
                if (['bool', 'int', 'float', 'if', 'expression', 'macro'].indexOf(type) < 0) {
                    throw new ParseError(file, i + 1, 'Directive #import: unsupported type, expected one of ["bool", "int", "float", "expression"]');
                }
                text = text.substring(type.length).trim();
                let require_as = false;
                if (text.startsWith('"')) {
                    require_as = true;
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
                    text = text.substring(targetName.length).trim();
                    keyword = text.split(/\s+/, 1)[0];
                } else {
                    if (require_as) {
                        throw new ParseError(file, i + 1, 'Directive #import: quoted name requires "as" keyword');
                    }
                    targetName = sourceName;
                }
                if (!/^[a-zA-Z_][a_zA-Z0-9_]*$/.test(targetName) || reserved_macro_words.indexOf(targetName) >= 0) {
                    throw new ParseError(file, i + 1, 'Directive #import: invalid target name');
                }
                if (keyword !== 'from') {
                    throw new ParseError(file, i + 1, 'Directive #import: invalid format, expected #import <type> <name> [as <target>] from "<url>"');
                }
                text = text.substring(keyword.length).trim();
                let targetUrl, relativeToFile;
                if (text.startsWith('"')) {
                    targetUrl = JSON.parse(text);
                    relativeToFile = true;
                } else if (text.startsWith('<')) {
                    if (!text.endsWith('>')) {
                        throw new ParseError(file, i + 1, 'Directive #import: incomplete angle bracket');
                    }
                    targetUrl = JSON.parse(`"${text.substring(1, text.length - 1)}"`);
                    relativeToFile = false;
                } else {
                    throw new ParseError(file, i + 1, 'Directive #import: url must be quoted or within angle-brackets');
                }
                const module = await getModule(targetUrl, relativeToFile ? [file] : modulePath);
                if (module == null) {
                    throw new ParseError(file, i + 1, `Directive #import: unable to find module: ${targetUrl}`);
                }
                const value = module[sourceName];
                let code = null;
                if (type === 'int') {
                    if (value != null) {
                        if (!Number.isSafeInteger(value)) {
                            throw new ParseError(file, i + 1, `Directive #import: expected type "int", but value is not an integer or not exported`);
                        }
                    }
                    code = `#define ${targetName} ${value.toString(10)}`;
                } else if (type === 'float') {
                    if (value != null) {
                        if (!isFinite(value)) {
                            throw new ParseError(file, i + 1, `Directive #import: expected type "float", but value is not a finite number`);
                        }
                    }
                    code = `#define ${targetName} ${value.toString()}`;
                } else if (type === 'bool') {
                    if (value != null) {
                        if (value) {
                            code = `#define ${targetName} 1`;
                        } else {
                            code = `#define ${targetName} 0`;
                        }
                    }
                } else if (type === 'if') {
                    if (value) {
                        code = `#define ${targetName}`;
                    }
                } else if (type === 'expression') {
                    if (value != null) {
                        if (typeof value === 'string') {
                            throw new ParseError(file, i + 1, `Directive #import: expected type "expression", but value is not a string`);
                        }
                        code = `#define ${targetName} ${getDefineCode(value)}\n#line ${i + 2} ${sourceIndex}`;
                    }
                } else if (type === 'macro') {
                    if (value != null) {
                        const macro = getMacro(value);
                        if (macro == null) {
                            throw new ParseError(file, i + 1, `Directive #import: expected type "macro", but value does not meet the Macro interface`);
                        }
                        if (macro.names.length > 0) {
                            code = `#define ${targetName}(${macro.names.join(', ')}) ${getDefineCode(value)}\n#line ${i + 2} ${sourceIndex}`;
                        } else {
                            code = `#define ${targetName} ${getDefineCode(value)}\n#line ${i + 2} ${sourceIndex}`;
                        }
                    }
                }
                if (code != null) {
                    target.push(code);
                } else {
                    target.push('');
                }
                continue;
            }
            if (directive === '#include') {
                text = text.substring(directive.length).trim();
                const keyword = text.split(/\s+/, 1)[0];
                let once = false;
                if (keyword === 'once') {
                    text = text.substring(keyword.length).trim();
                    once = true;
                }
                let targetUrl, relativeToFile;
                if (text.startsWith('"')) {
                    targetUrl = JSON.parse(text);
                    relativeToFile = true;
                } else if (text.startsWith('<')) {
                    if (!text.endsWith('>')) {
                        throw new ParseError(file, i + 1, 'Directive #include: incomplete angle bracket');
                    }
                    targetUrl = JSON.parse(`"${text.substring(1, text.length - 1)}"`);
                    relativeToFile = false;
                } else {
                    throw new ParseError(file, i + 1, 'Directive #include: url must be quoted or within angle-brackets');
                }
                const includeInfo = await getTextFile(targetUrl, relativeToFile ? [file] : modulePath);
                if (includeInfo == null) {
                    throw new ParseError(file, i + 1, `Directive #include: unable to find module: ${targetUrl}`);
                }
                if (once) {
                    if (files.indexOf(includeInfo[0]) >= 0) {
                        target.push('');
                        continue;
                    }
                }
                const generated = await do_preprocess(includeInfo[1], {
                    files,
                    file: includeInfo[0],
                    modulePath
                });
                target.push(generated);
                target.push(`#line ${i + 2} ${sourceIndex}`);
                continue;
            }
        }
        target.push(line);
    }
    return target.join('\n');
}

function parseSource({ source, file, sourceIndex }) {
    const target = [];
    for (let index = 0; index < source.length; ++index) {
        let line = source[index];
        const target_lines = [line];
        while (line.endsWith('\\')) {
            ++index;
            if (index >= source.length) {
                throw new ParseError(file, index, `Unfinished line continuation`);
            }
            line += '\n' + source[index];
            target_lines.push(source[index]);
        }
        line = line.trimStart();
        let match;
        if ((match = /^#include\s+/.exec(line)) != null) {
            line = line.substring(match[0].length);
            let once = /^once\s+/.exec(line);
            if (once != null) {
                line = line.substring(once[0].length);
                once = true;
            } else {
                once = false;
            }
            line = line.trim();
            const value = Object.create(null);
            value.once = once;
            value.source = target_lines;
            try {
                parseLocalUrl(value, line);
            } catch (e) {
                throw ParseError(file, index + 1, e.message);
            }
            target.push(value);
        } else if ((match = /^#import\s+/.exec(line)) != null) {
            line = line.substring(match[0].length);
            const value = Object.create(null);
            match = /^([a-z])\s+/.exec(line);
            if (match == null) {
                throw new ParseError(file, index, `#import directive: expected valid type`);
            }
            value.type = match[1];
            if (!(value.type in importType)) {
                throw new ParseError(file, index, `#import directive: expected valid type`);
            }
            line = line.substring(match[0].length);
            let t1;
            try {
                t1 = parseObjectPath(line);
            } catch (e) {
                throw new ParseError(file, index, e.message);
            }
            value.path = t1.path;
            line = t1.line;
            value.source = target_lines;
            match = /^as\s+/.exec(line);
            if (match != null) {
                line = line.substring(match[0].length);
                match = /^([a-zA-Z_][a-zA-Z0-9_]*)\s+/;
                if (match == null) {
                    throw new ParseError(file, index, `#import directive: expected valid #define name`);
                }
                value.name = match[1];
                line = line.substring(match[0].length);
            } else {
                if (value.path.length > 1 || !/^([a-zA-Z_][a-zA-Z0-9_]*)$/.test(value.path[0])) {
                    throw new ParseError(file, index, `#import directive: expected source name to be valid #define name`);
                }
                value.name = value.path[0];
            }
            match = /^from\s+/.exec(line);
            if (match == null) {
                throw new ParseError(file, index, `#import directive: expected "from" word`);
            }
            try {
                parseLocalUrl(value, line);
            } catch (e) {
                throw new ParseError(file, index, e.message);
            }
            value.line = index;
            value.fileIndex = sourceIndex;
            target.push(value);
        }
    }
}

const importType = {
    bool(target, context) {
        target.push(
            `#define ${context.name} ${context.value ? '1' : '0'}`,
            `#line ${context.line + context.source.length} ${context.fileIndex}`
        );
    },
    if(target, context) {
        const generated = [];
        if (context.value) {
            generated.push(`#define ${context.name}`);
        }
        generated.push(`#line ${context.line + context.source.length} ${context.fileIndex}`);
        target.push(...generated);
    }
};
Object.setPrototypeOf(importType, null);

function parseObjectPath(line) {
    const path = [];
    do {
        if (/^\s+/.test(line) || line.length < 0) {
            break;
        }
        if (line.startsWith('[')) {
            if (line[1] !== '"') {
                throw new Error(`#import directive: invalid path, expected string within square brackets`);
            }
            const end = /[^\\]"/g;
            end.lastIndex = 2;
            const match = end.exec(line);
            if (match == null) {
                throw new Error(`#import directive: unmatched quote`);
            }
            const entry = line.substring(0, match.index + 3); // +1 = ^\\, +2 = ", +3 = ]
            if (!entry.endsWith('"]')) {
                throw new Error(`#import directive: unmatched square bracket`);
            }
            const str = entry.substring(1, entry.length - 1);
            path.push(JSON.parse(str));
            line = line.substring(entry.length);
        } else {
            let end = line.indexOf('.');
            let length = 1;
            if (end < 0) {
                end = line.indexOf('[');
                if (end < 0) {
                    const match = /\s+/.exec(line);
                    if (match == null) {
                        throw new Error(`#import directive: expected "from" or "as" after a path`);
                    }
                    end = match.index;
                    length = 0;
                }
            }
            const str = line.substring(0, end);
            if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(str)) {
                throw new Error(`#import directive: invalid path, non-quoted path must be valid javascript literal name`);
            }
            line = line.substring(end + length);
            path.push(str);
        }
    } while (true);
    if (path.length <= 0) {
        throw new Error(`#import directive: invalid path`);
    }
    return { path, line };
}

function parseLocalUrl(target, source) {
    let local;
    if (source.startsWith('"')) {
        if (!source.endsWith('"')) {
            throw new Error('Unfinished quote');
        }
        local = true;
    } else if (source.startsWith('<')) {
        if (!source.endsWith('>')) {
            throw new Error('Unmatched angle bracket');
        }
        local = false;
        source = `"${source.substring(1, source.length - 1)}"`;
    } else {
        throw new Error('Expected <url> or "url" format');
    }
    target.url = JSON.parse(source);
    target.url_local = local;
}

function getMacro(object) {
    if (object !== Object(object)) {
        return null;
    }
    const result = Object.create(null);
    result.names = object.names;
    if (!Array.isArray(result.names)) {
        return null;
    }
    result.code = object.code;
    if (typeof result.code !== 'string' || result.code.length <= 0) {
        return null;
    }
    return result;
}

function getDefineCode(code) {
    code = code.split(/(?:\r?\n|\r)/mg);
    for (let i = 0; i < code.length - 1; ++i) {
        if (!code[i].endsWith('\\')) {
            code[i] += '\\';
        }
    }
    return code.join('\n');
}

async function getTextFile(url, paths) {
    const attempted = new Set();
    for (const path of paths) {
        const target = new URL(url, path).href;
        if (attempted.has(target)) {
            continue;
        }
        attempted.add(target);
        const response = await fetch(target);
        if (response.ok) {
            attempted.add(response.url);
            return Promise.all([response.url, response.text()]);
        }
    }
    return null;
}

async function getModule(url, paths) {
    const attempted = new Set();
    for (const path of paths) {
        const target = new URL(url, path).href;
        if (attempted.has(target)) {
            continue;
        }
        attempted.add(target);
        try {
            return await import(target);
        } catch (e) {
            continue;
        }
    }
    return null;
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
];

export async function load(url, { modulePath = [document.baseURI] } = {}) {
    const files = [];
    const info = await getTextFile(url, modulePath);
    if (info == null) {
        throw new ReferenceError(`Unable to load file: ${url}`);
    }
    return { source: await do_preprocess(info[1], { files, file: info[0], modulePath }), files };
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
