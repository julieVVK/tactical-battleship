// File was created by Vladyslav Doroshenko

import { Router } from "express"
import * as user from "../users.js"
import { statistics } from "../statistics.js"


export default function createUserRouter() {
    const router = Router()

    router.post('/createUser', (req, res) => {
        const response = user.createGuest()

        return res.status(200).json(response)
    });


    router.get('/statistics', (req, res) => {
        const { offset = "0", limit = "10" } = req.query
        const start = Number(offset)
        const size = Number(limit)

        return res.json({
            ...statistics,
            recentMatches: statistics.recentMatches.slice(start, start + size)
        })
    })


    return router
}
