// File was created by Vladyslav Doroshenko

// Changed after 1st consultation:
// reimplementing translation to meet project requirements
// now language provider asks backend for the dictionary and updates the document language
// Changes in this file: deleted dictionary imports from the file

export const DEFAULT_LANGUAGE = 'en';
export const LANGUAGE_STORAGE_KEY = 'battleships.language';

export const COUNTRIES = ['GB', 'CZ', 'SK', 'RU', 'UA', 'PL', 'DE'];


export function getSavedLanguage() {
    try {
        const language = localStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (language === null) {
            saveLanguage(DEFAULT_LANGUAGE);
            return DEFAULT_LANGUAGE;
        }

        return language;
    } catch {
        return DEFAULT_LANGUAGE;
    }
}


export function saveLanguage(language) {
    try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
        // continue
        // Switching still works when the browser blocks local storage
        // just without saving it to the local storage
    }
}


// parse custom values like {username} and translate them
// dictionary contains all translated strings received from the server
export function translate(dictionary, key, values = {}) {
    const string = dictionary[key] ?? key;

    /* regex meaning:
     * \{(\w+)\} - matches a placeholder in the form of {name}
     * \{   opening curly brace
     * \w+  one or more word characters of the preceding character
     * ()   capture group, meaning that the matched text should be returned as a SEPARATE argument to the callback function
     * g    global flag, meaning that all placeholders should be replaced, not just the first one
     */
    return string.replace(/\{(\w+)\}/g, (placeholder, name) =>
        Object.hasOwn(values, name) ? String(values[name]) : placeholder,
    );
}


// update the document language and title
export function updateDocumentLanguage(language, dictionary) {
    document.documentElement.lang = language;
    document.title = translate(dictionary, 'app.title');
}
