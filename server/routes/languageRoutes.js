// File was created by Vladyslav Doroshenko
// dedicated router only for the languages

// reimplementing translation to meet project requirements
// moving translation to the server so there is an MVC (V -> C -> M) communication
//                                                     (V <- C <- M)

import { Router } from "express"
import { LANGUAGES, getDictionary } from "../translations.js"



export default function createLanguageRouter() {
    const router = Router()

    // list of supported languages for the settings page
    router.get('/languages', (req, res) => {
        return res.status(200).json(LANGUAGES)
    })

    // dictionary of one specific language
    router.get('/languages/:language', (req, res) => {
        return res.status(200).json(getDictionary(req.params.language))
    })


    return router
}
