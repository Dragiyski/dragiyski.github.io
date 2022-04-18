/* eslint-disable quote-props */
export const vowels = Object.assign(Object.create(null), {
    'æ': [0, 1, 2, 3],
    'aː': [0, 1, 4, 5],
    'ɒ': [1, 2, 3],
    'eɪ': [1],
    'ɛ': [2, 3, 4, 5],
    'iː': [1, 2, 3, 4, 5],
    'ɪə': [1, 2, 3, 5],
    'ə': [0, 1],
    'eə': [2, 3, 5],
    'ɪ': [4, 5],
    'aɪ': [0],
    'ɜː': [0, 2, 3, 4, 5],
    'əʊ': [0, 1, 2, 3, 4, 5],
    'ɔɪ': [4],
    'uː': [0, 1, 2, 3, 4],
    'ʊ': [2, 3, 4],
    'aʊ': [5],
    'ɔː': [0, 1, 2, 3, 5]
});

export const consonants = Object.assign(Object.create(null), {
    'b': [7, 11],
    'tʃ': [8, 10],
    'd': [7, 9, 11],
    'f': [6, 9, 10],
    'g': [6, 10, 11],
    'h': [7, 10, 11],
    'dʒ': [7, 9],
    'k': [6, 7, 11],
    'l': [7, 10],
    'm': [9, 11],
    'n': [8, 9, 11],
    'ŋ': [6, 7, 8, 9, 10, 11],
    'p': [6, 10],
    'r': [6, 7, 10],
    's': [6, 7, 9, 10],
    'ʃ': [6, 8, 9, 10, 11],
    't': [6, 8, 10],
    'θ': [6, 7, 8, 10],
    'ð': [7, 9, 10, 11],
    'v': [7, 8, 11],
    'w': [6, 8],
    'j': [7, 8, 10],
    'z': [7, 8, 10, 11],
    'ʒ': [6, 7, 8, 9, 11]
});

const examples = Object.assign(Object.create(null), {
    'æ': ['c<em>a</em>t', 'h<em>a</em>t'],
    'aː': ['<em>ar</em>e', 'c<em>ar</em>', '<em>ar</em>m'],
    'ɒ': ['sw<em>a</em>n', 't<em>o</em>p'],
    'eɪ': ['p<em>ay</em>', 'c<em>a</em>ke'],
    'ɛ': ['<em>e</em>nd', 's<em>e</em>nd'],
    'iː': ['b<em>ee</em>', 's<em>ee</em>'],
    'ɪə': ['b<em>eer</em>', 'h<em>er</em>e'],
    'ə': ['<em>a</em> word', '<em>a</em>vailable', 's<em>u</em>n'],
    'eə': ['<em>air</em>', 'th<em>er</em>e'],
    'ɪ': ['s<em>i</em>', 'b<em>i</em>t'],
    'aɪ': ['g<em>uy</em>', 'p<em>ie</em>', 'r<em>i</em>ce'],
    'ɜː': ['b<em>ir</em>d', 'h<em>ear</em>d'],
    'əʊ': ['t<em>oe</em>', 'r<em>ow</em>', 'm<em>ow</em>n'],
    'ɔɪ': ['t<em>oy</em>', 'c<em>oi</em>n'],
    'uː': ['t<em>oo</em>', 's<em>oo</em>n'],
    'ʊ': ['l<em>oo</em>k', 'p<em>u</em>t', 'c<em>ou</em>ld'],
    'aʊ': ['h<em>ow</em>', 'br<em>ow</em>n'],
    'ɔː': ['y<em>our</em>', 'sh<em>or</em>e'],
    'b': ['<em>b</em>a<em>b</em>y', '<em>b</em>anana'],
    'tʃ': ['<em>ch</em>at', '<em>ch</em>est'],
    'd': ['<em>d</em>og', '<em>d</em>ance'],
    'f': ['<em>f</em>ox', '<em>f</em>inal'],
    'g': ['<em>g</em>un', '<em>gh</em>ost', '<em>g</em>et'],
    'h': ['<em>h</em>at', '<em>h</em>op', '<em>h</em>ero'],
    'dʒ': ['<em>j</em>am', '<em>j</em>oin', 'le<em>g</em>end'],
    'k': ['stu<em>ck</em>', '<em>c</em>at', '<em>k</em>ill'],
    'l': ['<em>l</em>ive', '<em>l</em>ove', '<em>l</em>augh'],
    'm': ['<em>m</em>an', 'wo<em>m</em>an'],
    'n': ['<em>n</em>ew', '<em>n</em>ext', 'libraria<em>n</em>'],
    'ŋ': ['amazi<em>ng</em>', 'thi<em>ng</em>', 'thi<em>n</em>k'],
    'p': ['<em>p</em>ower'],
    'r': ['<em>r</em>un', '<em>r</em>eg<em>r</em>et'],
    's': ['<em>s</em>and', '<em>s</em>orry'],
    'ʃ': ['<em>sh</em>ut', '<em>s</em>ure'],
    't': ['<em>t</em>unic', '<em>t</em>ransla<em>t</em>e'],
    'θ': ['<em>th</em>in', '<em>th</em>ick'],
    'ð': ['<em>th</em>is', '<em>th</em>ere'],
    'v': ['<em>v</em>ine', '<em>v</em>ision'],
    'w': ['<em>w</em>it', '<em>w</em>ait'],
    'j': ['<em>y</em>ou', '<em>y</em>es', '<em>y</em>ellow'],
    'z': ['<em>z</em>one'],
    'ʒ': ['plea<em>s</em>ure', 'vi<em>s</em>ion', '<em>g</em>enre'],
});

export const database = Object.assign(Object.create(null), vowels, consonants);

for (const phoneme in examples) {
    if (phoneme in database) {
        database[phoneme].examples = examples[phoneme];
    }
}

export function getTextRepresentation(active) {
    if (active.length <= 0) {
        return '';
    }
    const pair = [null, null];
    const hasVowel = active.filter(i => i >= 0 && i <= 5).length > 0;
    const hasConsonant = active.filter(i => i >= 6 && i <= 11).length > 0;
    for (const [pairIndex, database, minIndex, maxIndex] of [[0, consonants, 6, 11], [1, vowels, 0, 5]]) {
        phoneme_loop: for (const phoneme in database) {
            const indices = database[phoneme];
            for (let i = minIndex; i <= maxIndex; ++i) {
                const hasIndex = indices.indexOf(i) >= 0;
                const isActive = active.indexOf(i) >= 0;
                if (hasIndex && !isActive) {
                    continue phoneme_loop;
                }
                if (!hasIndex && isActive) {
                    continue phoneme_loop;
                }
            }
            pair[pairIndex] = phoneme;
        }
    }
    if (pair[0] == null && pair[1] == null) {
        return '?';
    }
    if (hasVowel) {
        if (pair[1] == null) {
            pair[1] = '?';
        }
    } else {
        pair[1] = '';
    }
    if (hasConsonant) {
        if (pair[0] == null) {
            pair[0] = '?';
        }
    } else {
        pair[0] = '';
    }
    const isInverse = active.indexOf(12) >= 0;
    if (isInverse) {
        return pair[1] + pair[0];
    } else {
        return pair[0] + pair[1];
    }
}

Object.setPrototypeOf(database, null);
