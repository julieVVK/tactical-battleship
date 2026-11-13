// File was created by Vladyslav Doroshenko

// Changed after 1st consultation:
// reimplementing translation to meet project requirements
// Changes in this file: now language provider asks backend for the dictionary and updates the document language

import {useEffect, useState} from 'react'
import {LanguageContext} from './LanguageContext.js'
import { getDictionary, getLanguages } from '../api.js'
import {
    getSavedLanguage,
    LANGUAGE_STORAGE_KEY,
    saveLanguage,
    translate,
    updateDocumentLanguage,
} from './translation.js'

function LanguageProvider({ children }) {
    // list of languages from the server
    const [languages, setLanguages] = useState([])
    // current language and its dictionary from the server
    const [language, setCurrentLanguage] = useState(null)
    const [dictionary, setDictionary] = useState(null)
    const [error, setError] = useState(null)


    // ask the server for the dictionary and show it
    async function setLanguage(language) {
        const response = await getDictionary(language)
        saveLanguage(response.language)
        setCurrentLanguage(response.language)
        setDictionary(response.dictionary)
    }

    // load the language list and the saved language
    useEffect(() => {
        getLanguages()
          .then((languages) => {
            setLanguages(languages)
          })
          .catch(() => {
              setError({status: "500", message: "unable to get dictionaries, server is down"})
          })

        setLanguage(getSavedLanguage()).catch(() => {
            setError({status: "500", message: "unable to get dictionaries, server is down"})
        })
    }, [])

    // update document language when language changes
    useEffect(() => {
        if (dictionary)
            updateDocumentLanguage(language, dictionary)
    }, [language, dictionary])

    // get saved language when another tab changes it
    useEffect(() => {
        function handleStorage(event) {
            if (event.key === LANGUAGE_STORAGE_KEY || event.key === null) {
                setLanguage(getSavedLanguage())
            }
        }

        window.addEventListener('storage', handleStorage)

        return () => window.removeEventListener('storage', handleStorage)
    }, [])

    // Simply return LanguageProvider as a React component
    // Bad architecture decision, but in our case uptime is 100%
    if (error)
        return (
            <div style={{display: "grid",
                placeItems: "center",
                minHeight: "100vh"}}>
                    <h1>Error {error.status}: Server is down</h1>
            </div>
        )

    // wait for the first dictionary from the server
    if (!dictionary)
        return (<p>Waiting...</p>)

    // "main" translation function that we pass through our context
    // which then uses internal `dictionary` variable to translate words
    const t = (key, values) => translate(dictionary, key, values)

    return (
        <LanguageContext.Provider value={{language, languages, setLanguage, t}}>
            {children}
        </LanguageContext.Provider>
    )
}

export default LanguageProvider
