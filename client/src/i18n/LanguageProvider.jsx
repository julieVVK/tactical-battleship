// File was created by Vladyslav Doroshenko

import {useEffect, useState} from 'react'
import {LanguageContext} from './LanguageContext.js'
import {
    getSavedLanguage,
    LANGUAGE_STORAGE_KEY,
    normalizeLanguage,
    saveLanguage,
    translate,
    updateDocumentLanguage,
} from './translation.js'

function LanguageProvider({children}) {
    // current saved language
    // we don't call getSavedLanguage function to execute it only once
    const [language, setCurrentLanguage] = useState(getSavedLanguage)

    // parse language
    function setLanguage(value) {
        const nextLanguage = normalizeLanguage(value)
        saveLanguage(nextLanguage)
        setCurrentLanguage(nextLanguage)
    }

    // update document language when language changes
    useEffect(() => {
        updateDocumentLanguage(language)
    }, [language])

    // get saved language when another tab changes it
    useEffect(() => {
        function handleStorage(event) {
            if (event.key === LANGUAGE_STORAGE_KEY || event.key === null) {
                setCurrentLanguage(getSavedLanguage())
            }
        }

        window.addEventListener('storage', handleStorage)

        return () => window.removeEventListener('storage', handleStorage)
    }, [])

    // "main" translation function that we pass through our context
    // which then uses internal `language` variable to translate words
    const t = (key, values) => translate(language, key, values)

    return (
        <LanguageContext.Provider value={{language, setLanguage, t}}>
            {children}
        </LanguageContext.Provider>
    )
}

export default LanguageProvider