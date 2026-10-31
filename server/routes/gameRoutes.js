// File was created by Vladyslav Doroshenko

import { Router } from "express"
import * as game from "../games.js"
import publishGame from "../gameEvents.js"
import fail from "../error.js"


export default function createGameRouter(io) {
    const router = Router()

    router.post('/createGames', (req, res) => {
        console.log(req.body)
        const userId = req.get("userId")
        const localGame = game.createGame(userId)

        publishGame(io, localGame.id)

        return res.status(200).json(game.getGameForPlayer(localGame.id, userId))
    });


    // create a new game against the robot
    router.post('/createRobotGame', (req, res) => {
        const userId = req.get("userId");

        // create the game and generate the robot's fleet
        const localGame = game.createRobotGame(userId);

        // notify connected client about the new game
        publishGame(io, localGame.id);

        // return the game state
        return res.status(200).json(
            game.getGameForPlayer(localGame.id, userId)
        );
    });


    router.post('/games/:gameId/join', (req, res) => {
        console.log("req.body:", req.body)
        console.log("req.params:", req.params)

        const userId = req.get("userId")
        const gameId = req.params.gameId

        const response = game.joinGame(gameId, userId)
        publishGame(io, gameId)
        return res.status(200).json(response)
    });


    router.post("/games/:gameId/ready", (req, res) => {
        console.log("req.body:", req.body)
        console.log("req.params:", req.params)
        if (!req.body)
            fail("INVALID_REQUEST_BODY", "Send a JSON request body.")

        const userId = req.get("userId")
        const { board } = req.body
        const gameId = req.params.gameId

        const response = game.readyPlayer(gameId, userId, board)
        publishGame(io, gameId)
        return res.status(200).json(response)
    });


    router.post("/games/:gameId/unready", (req, res) => {
        console.log("req.body:", req.body)
        console.log("req.params:", req.params)

        const userId = req.get("userId")
        const gameId = req.params.gameId

        const response = game.unreadyPlayer(gameId, userId)
        publishGame(io, gameId)
        return res.status(200).json(response)
    });


    router.post("/games/:gameId/shots", (req, res) => {
        console.log("req.body:", req.body)
        console.log("req.params:", req.params)
        if (!req.body)
            fail("INVALID_REQUEST_BODY", "Send a JSON request body.")

        const userId = req.get("userId")
        const { row, col } = req.body
        const gameId = req.params.gameId

        const response = game.fireShot(gameId, userId, row, col)
        game.playRobotTurn(gameId)
        publishGame(io, gameId)
        const current = game.getGameForPlayer(gameId, userId)
        return res.status(200).json({
            ...response,
            phase: current.phase,
            turnPlayerId: current.turnPlayerId,
            winnerPlayerId: current.winnerPlayerId,
        })
    })


    router.post("/games/:gameId/gadgets/:gadget", (req, res) => {
        if (!req.body)
            fail("INVALID_REQUEST_BODY", "Send a JSON request body.")

        const view = game.useGadget(req.params.gameId, req.get("userId"), req.params.gadget, req.body)
        publishGame(io, view.id)

        return res.status(200).json(view)
    })


    router.get("/games/:gameId", (req, res) => {
        console.log("req.params:", req.params)
        console.log("req.body:", req.body)

        const gameId = req.params.gameId
        const userId = req.get("userId")

        const localGame = game.getGameForPlayer(gameId, userId)

        return res.status(200).json(localGame)
    })

    return router
}
