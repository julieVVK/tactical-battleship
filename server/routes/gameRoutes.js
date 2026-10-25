// File was created by Vladyslav Doroshenko

import { Router } from "express"
import * as game from "../games.js"
import requireSession from "../sessionMiddleware.js"
import publishGame from "../gameEvents.js"
import fail from "../error.js"


export default function createGameRouter(io) {
    const router = Router()

    router.post('/createGames', requireSession, (req, res) => {
        const userId = req.userId
        const localGame = game.createGame(userId)

        publishGame(io, localGame.id)

        return res.status(200).json(game.getGameForPlayer(localGame.id, userId))
    });


    router.post('/games/:gameId/join', requireSession, (req, res) => {

        const userId = req.userId
        const gameId = req.params.gameId

        const response = game.joinGame(gameId, userId)
        publishGame(io, gameId)
        return res.status(200).json(response)
    });


    router.post("/games/:gameId/ready", requireSession, (req, res) => {
        if (!req.body)
            fail("INVALID_REQUEST_BODY", "Send a JSON request body.")

        const userId = req.userId
        const { board } = req.body
        const gameId = req.params.gameId

        game.readyPlayer(gameId, userId, board)
        game.playRobotTurn(gameId)
        const response = game.getGameForPlayer(gameId, userId)
        publishGame(io, gameId)
        return res.status(200).json(response)
    });


    router.post("/games/:gameId/unready", requireSession, (req, res) => {

        const userId = req.userId
        const gameId = req.params.gameId

        const response = game.unreadyPlayer(gameId, userId)
        publishGame(io, gameId)
        return res.status(200).json(response)
    });


    router.post("/games/:gameId/shots", requireSession, (req, res) => {
        if (!req.body)
            fail("INVALID_REQUEST_BODY", "Send a JSON request body.")

        const userId = req.userId
        const { row, col } = req.body
        const gameId = req.params.gameId

        const response = game.fireShot(gameId, userId, row, col)
        game.playRobotTurn(gameId)
        publishGame(io, gameId)
        return res.status(200).json(response)
    })


    router.get("/games/:gameId", requireSession, (req, res) => {

        const gameId = req.params.gameId
        const userId = req.userId

        const localGame = game.getGameForPlayer(gameId, userId)

        return res.status(200).json(localGame)
    })

    router.post("/createRobotGame", requireSession, (req, res) => {
        const response = game.createRobotGame(req.userId)
        return res.status(200).json(response)
    })


    router.post("/games/:gameId/gadgets/:gadget", requireSession, (req, res) => {
        if (!req.body)
            fail("INVALID_REQUEST_BODY", "Send a JSON request body.")

        const gameId = req.params.gameId
        const userId = req.userId
        const gadget = req.params.gadget
        const {row, col, shipId, vertical} = req.body

        const response = game.useGadget(gameId, userId, gadget, row, col, shipId, vertical)
        publishGame(io, gameId)
        return res.status(200).json(response)
    })


    router.post("/games/:gameId/leave", requireSession, (req, res) => {
        const gameId = req.params.gameId
        const userId = req.userId

        const response = game.leaveGame(gameId, userId)
        publishGame(io, gameId)
        return res.status(200).json(response)
    })

    return router
}
