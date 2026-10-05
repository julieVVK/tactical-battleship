// File was created by Vladyslav Doroshenko

import { Router } from "express"
import * as game from "../games.js"
import requireSession from "../sessionMiddleware.js"
import publishGame from "../gameEvents.js"
import fail from "../error.js"


export default function createGameRouter(io) {
    const router = Router()

    router.post('/createGames', requireSession, (req, res) => {
        console.log(req.body)
        const userId = req.userId
        const localGame = game.createGame(userId)

        publishGame(io, localGame.id)

        return res.status(200).json(game.getGameForPlayer(localGame.id, userId))
    });


    router.post('/games/:gameId/join', requireSession, (req, res) => {
        console.log("req.body:", req.body)
        console.log("req.params:", req.params)

        const userId = req.userId
        const gameId = req.params.gameId

        const response = game.joinGame(gameId, userId)
        publishGame(io, gameId)
        return res.status(200).json(response)
    });


    router.post("/games/:gameId/ready", requireSession, (req, res) => {
        console.log("req.body:", req.body)
        console.log("req.params:", req.params)
        if (!req.body)
            fail("INVALID_REQUEST_BODY", "Send a JSON request body.")

        const userId = req.userId
        const { board } = req.body
        const gameId = req.params.gameId

        const response = game.readyPlayer(gameId, userId, board)
        publishGame(io, gameId)
        return res.status(200).json(response)
    });


    router.post("/games/:gameId/unready", requireSession, (req, res) => {
        console.log("req.body:", req.body)
        console.log("req.params:", req.params)

        const userId = req.userId
        const gameId = req.params.gameId

        const response = game.unreadyPlayer(gameId, userId)
        publishGame(io, gameId)
        return res.status(200).json(response)
    });


    router.post("/games/:gameId/shots", requireSession, (req, res) => {
        console.log("req.body:", req.body)
        console.log("req.params:", req.params)
        if (!req.body)
            fail("INVALID_REQUEST_BODY", "Send a JSON request body.")

        const userId = req.userId
        const { row, col } = req.body
        const gameId = req.params.gameId

        const response = game.fireShot(gameId, userId, row, col)
        publishGame(io, gameId)
        return res.status(200).json(response)
    })


    router.get("/games/:gameId", requireSession, (req, res) => {
        console.log("req.params:", req.params)
        console.log("req.body:", req.body)

        const gameId = req.params.gameId
        const userId = req.userId

        const localGame = game.getGameForPlayer(gameId, userId)

        return res.status(200).json(localGame)
    })

    return router
}
