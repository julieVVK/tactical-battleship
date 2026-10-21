// File was created by Vladyslav Doroshenko

import en from './locales/en.json' with {type: 'json'};
import cs from './locales/cs.json' with {type: 'json'};
import sk from './locales/sk.json' with {type: 'json'};
import ru from './locales/ru.json' with {type: 'json'};
import uk from './locales/uk.json' with {type: 'json'};
import pl from './locales/pl.json' with {type: 'json'};
import de from './locales/de.json' with {type: 'json'};

export const DEFAULT_LANGUAGE = 'en';
export const LANGUAGE_STORAGE_KEY = 'battleships.language';

export const LANGUAGES = [
    {code: 'en', name: 'English'},
    {code: 'cs', name: 'Čeština'},
    {code: 'sk', name: 'Slovenčina'},
    {code: 'ru', name: 'Русский'},
    {code: 'uk', name: 'Українська'},
    {code: 'pl', name: 'Polski'},
    {code: 'de', name: 'Deutsch'},
];

export const translations =
    {
        en: en,
        cs: cs,
        sk: sk,
        ru: ru,
        uk: uk,
        pl: pl,
        de: de
    };


export function normalizeLanguage(language) {
    if (language === 'cz')
        return 'cs';

    return LANGUAGES.some(({code}) => code === language) ? language : DEFAULT_LANGUAGE;
}


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
        // Switching still works when the browser blocks local storage.
        // just without saving it to the local storage
    }
}


// parse custom values like {username} and translate them
export function translate(language, key, values = {}) {
    const message = translations[normalizeLanguage(language)][key] ?? en[key] ?? key;

    /* regex meaning:
     * \{(\w+)\} - matches a placeholder in the form of {name}
     * \{   opening curly brace
     * \w+  one or more word characters of the preceding character
     * ()   capture group, meaning that the matched text should be returned as a SEPARATE argument to the callback function
     * g    global flag, meaning that all placeholders should be replaced, not just the first one
     */
    return message.replace(/\{(\w+)\}/g, (placeholder, name) =>
        Object.hasOwn(values, name) ? String(values[name]) : placeholder,
    );
}


// update the document language and title
export function updateDocumentLanguage(language) {
    document.documentElement.lang = normalizeLanguage(language);
    document.title = translate(language, 'app.title');
}
