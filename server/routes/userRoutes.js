// File was created by Vladyslav Doroshenko

import { Router } from "express"
import * as user from "../users.js"
import { createSession, removeSession } from "../sessions.js"
import requireSession from "../sessionMiddleware.js"
import fail from "../error.js"
import { statistics } from "../statistics.js"
import {getGames, leaveGame} from "../games.js"
import publishGame from "../gameEvents.js"


export default function createUserRouter(io) {
    const router = Router()

    router.post('/createUser', (req, res) => {
        console.log(req.body)
        if (!req.body)
            fail("INVALID_REQUEST_BODY", "Send a JSON request body.")

        const { userId, userName } = req.body

        const response = user.createUser(userId, userName)

        const session = createSession(response.id)

        return res.status(200).json({
            ...response,
            token: session.token
        })
    });


    // Endpoint just for token validation.
    // 204 - OK but No content.
    // May be removed in the future.
    router.get('/session', requireSession, (req, res) => {
        return res.sendStatus(204)
    })

    router.get('/statistics', requireSession, (req, res) => {
        const { offset = "0", limit = "10" } = req.query
        const start = Number(offset)
        const size = Number(limit)

        return res.json({
            ...statistics,
            recentMatches: statistics.recentMatches.slice(start, start + size)
        })
    })


    // Delete the session identified by this request's token.
    router.get('/signout', requireSession, (req, res) => {
        for (const game of getGames()) {
            const isPlayer = game.players.some(player => player.id === req.userId)
            if (!isPlayer || game.phase === "finished" || game.phase === "cancelled") continue

            leaveGame(game.id, req.userId)
            publishGame(io, game.id)
        }

        removeSession(req.sessionToken)

        for (const socket of io.sockets.sockets.values()) {
            if (socket.data.sessionToken === req.sessionToken)
                socket.disconnect(true)
        }

        return res.json({message: "Successfully signed out"} )
    })

    return router
}
