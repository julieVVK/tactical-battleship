// File was created by Vladyslav Doroshenko


// we need to use type: "json" because we want to import the JSON files directly
// Vite can understand JSON without any additional configuration,
// but Node will throw new error ERR_IMPORT_ATTRIBUTE_MISSING Module
import en_js from "./locales/en.json" with {type: "json"}
import cs_js from "./locales/cs.json" with {type: "json"}
import sk_js from "./locales/sk.json" with {type: "json"}
import ru_js from "./locales/ru.json" with {type: "json"}
import uk_js from "./locales/uk.json" with {type: "json"}
import pl_js from "./locales/pl.json" with {type: "json"}
import de_js from "./locales/de.json" with {type: "json"}


export const DEFAULT_LANGUAGE = "en"

export const LANGUAGES = [
    {code: "en", name: "English"},
    {code: "cs", name: "Čeština"},
    {code: "sk", name: "Slovenčina"},
    {code: "ru", name: "Русский"},
    {code: "uk", name: "Українська"},
    {code: "pl", name: "Polski"},
    {code: "de", name: "Deutsch"},
]


const dictionaries = {
    en: en_js,
    cs: cs_js,
    sk: sk_js,
    ru: ru_js,
    uk: uk_js,
    pl: pl_js,
    de: de_js,
}


export function normalizeLanguage(language) {
    if (language === "cz")
        return "cs"

    return LANGUAGES.some(({code}) => code === language) ? language : DEFAULT_LANGUAGE
}


// returns the chosen language and its dictionary
// missing keys are taken from the English dictionary
export function getDictionary(language) {
    const code = normalizeLanguage(language)

    return {
        language: code,
        // was something like dictionaries[code][key] ?? en_js[key] ?? key
        // but the second half is now on the frontend
        dictionary: {...dictionaries[DEFAULT_LANGUAGE], ...dictionaries[code]},
    }
}
