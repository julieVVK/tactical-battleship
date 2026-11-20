// File was created by Vladyslav Doroshenko

import { Router } from "express"
import * as user from "../users.js"
import { getStatistics } from "../statistics.js"
import fail from "../error.js"


export default function createUserRouter() {
    const router = Router()

    router.post('/createUser', (req, res) => {
        const response = user.createGuest()

        return res.status(200).json(response)
    });


    // author: Marie Pindorová
    // connects HTTP request to the model
    router.get('/statistics', (req, res) => {
        const userId = req.get("userId")
        if (!userId) fail("INVALID_USER_ID", "User ID header is required.")
        if (!user.getUser(userId)) fail("USER_NOT_FOUND", "User not found.")

        // convert a query parameter into a usable integer
        const parsePageValue = (value, defaultValue) => {

            // if the client omits the parameter, the route uses the default offset 0 or limit 10
            if (value === undefined) {
               return defaultValue 
            }

            // query parameters should be strings containing digits
            if (typeof value !== "string" || !/^\d+$/.test(value)) {
                return null
            }

            // convert the string to a number
            const parsed = Number(value)

            // returning null signals invalid output
            return Number.isSafeInteger(parsed) ? parsed : null
        }

        const offset = parsePageValue(req.query.offset, 0)
        const limit = parsePageValue(req.query.limit, 10)

        if (offset === null || limit === null || limit < 1 || limit > 100)
            fail("INVALID_PAGINATION", "Offset must be non-negative and limit must be between 1 and 100.")

        // the controller calls the statistics model with the user and page parameters,
        // then returns the result in JSON
        return res.json(getStatistics(userId, offset, limit))
    })


    return router
}
