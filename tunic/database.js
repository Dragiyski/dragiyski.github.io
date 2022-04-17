/* eslint-disable quote-props */
export const vowels = {
    'æ': [0, 1, 2, 3],
    'aː': [0, 1, 4, 5],
    'ɒ': [1, 2, 3],
    'eɪ': [1],
    'e': [2, 3, 4, 5],
    'iː': [1, 2, 3, 4, 5],
    'ɪə': [1, 2, 3, 5],
    'ə': [0, 1],
    'eə': [1, 3, 5],
    'ɪ': [4, 5],
    'aɪ': [0],
    'ɜː': [0, 2, 3, 4, 5],
    'əʊ': [0, 1, 2, 3, 4, 5],
    'ɔɪ': [4],
    'uː': [0, 1, 2, 3, 4],
    'ʊ': [2, 3, 4],
    'aʊ': [5],
    'ɔː': [0, 1, 2, 3, 5]
};

export const consonants = {
    'b': [7, 9],
    'tʃ': [8, 10],
    'd': [7, 9, 11],
    'f': [6, 10, 11],
    'g': [6, 9, 10],
    'h': [7, 9, 10],
    'dʒ': [7, 11],
    'k': [6, 7, 9],
    'l': [7, 10],
    'm': [9, 11],
    'n': [8, 9, 11],
    'ŋ': [6, 7, 8, 9, 10, 11],
    'p': [6, 10],
    'r': [6, 7, 11],
    's': [6, 7, 10, 11],
    'ʃ': [6, 8, 9, 10, 11],
    't': [6, 8, 10],
    'θ': [6, 7, 8, 10],
    'ð': [7, 9, 10, 11],
    'v': [7, 8, 9],
    'w': [6, 8],
    'j': [7, 8, 10],
    'z': [7, 8, 9, 10],
    'ʒ': [6, 7, 8, 9, 11]
};

export const database = Object.assign(Object.create(null), vowels, consonants);

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
