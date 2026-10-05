// File was created by Vladyslav Doroshenko

// Only this module changes stored games. Public functions return copies.

import {randomBytes} from "node:crypto"
import {getUser} from "./users.js"
import {prepareFleet} from "./placement.js"
import {BOARD_SIZE} from "./rules.js"
import fail from "./error.js"


/* ==========- GAME OBJECT -========== */
// const game = {
//     id: makeGameId(),
//     phase: "waiting",
//     players: [makePlayer(user)],
//     turnPlayerId: null,
//     winnerPlayerId: null,
// }
/* ==========- GAME OBJECT -========== */


/* ==========- PLAYER OBJECT -========== */
const makePlayer = (user) => {
    return {
        id: user.id,
        name: user.name,
        ready: false,
        ships: [],
        shots: [],
    }
}
/* ==========- PLAYER OBJECT -========== */


const games = new Map()


const normalizeGameId = (gameId) => {
    if (typeof gameId !== "string" || !/^[A-Fa-f0-9]{6}$/.test(gameId.trim()))
        fail("INVALID_GAME_ID", "Enter a six-character game code.")

    return gameId.trim().toUpperCase()
}


const makeGameId = () => {
    let gameId

    do {
        gameId = randomBytes(3).toString("hex").toUpperCase()
    } while (games.has(gameId))

    return gameId
}


export const createGame = (userId) => {
    const user = getUser(userId)
    if (!user)
        fail("USER_NOT_FOUND", "User not found.")

    const game = {
        id: makeGameId(),
        phase: "waiting",
        players: [makePlayer(user)],
        turnPlayerId: null,
        winnerPlayerId: null,
    }

    games.set(game.id, game)
    return structuredClone(game)
}


export const joinGame = (gameId, userId) => {
    const user = getUser(userId)
    if (!user)
        fail("USER_NOT_FOUND", "User not found.")

    const game = games.get(normalizeGameId(gameId))
    if (!game)
        fail("GAME_NOT_FOUND", "Game not found.")

    if (game.players.some(player => player.id === userId))
        fail("PLAYER_ALREADY_JOINED", "This user is already in the game.")

    if (game.phase !== "waiting")
        fail("GAME_JOIN_CLOSED", "This game no longer accepts players.")

    if (game.players.length >= 2)
        fail("GAME_FULL", "This game already has two players.")

    game.players.push(makePlayer(user))
    game.phase = "placement"

    const returnValue = getGameForPlayer(game.id, userId)
    return structuredClone(returnValue)
}


export const readyPlayer = (gameId, userId, board) => {
    const game = games.get(normalizeGameId(gameId))
    if (!game)
        fail("GAME_NOT_FOUND", "Game not found.")

    if (game.phase !== "waiting" && game.phase !== "placement")
        fail("SHIP_PLACEMENT_CLOSED", "Ship placement is already closed.")

    const player = game.players.find(player => player.id === userId)
    if (!player)
        fail("PLAYER_NOT_IN_GAME", "This user is not in the game.")
    if (player.ready)
        fail("PLAYER_ALREADY_READY", "Cancel Ready before changing the fleet.")

    const fleet = prepareFleet(board)
    if (fleet.error) fail("INVALID_FLEET", fleet.error)

    player.ships = fleet
    player.ready = true

    if (game.players.length === 2 && game.players.every(player => player.ready)) {
        game.phase = "battle"
        game.turnPlayerId = game.players[  Math.floor(Math.random() + 0.5)  ].id
    }

    const returnValue = getGameForPlayer(game.id, userId)
    return structuredClone(returnValue)
}


export const unreadyPlayer = (gameId, userId) => {
    const game = games.get(normalizeGameId(gameId))
    if (!game)
        fail("GAME_NOT_FOUND", "Game not found.")

    if (game.phase !== "waiting" && game.phase !== "placement")
        fail("SHIP_PLACEMENT_CLOSED", "The battle has already started.")

    const player = game.players.find(player => player.id === userId)
    if (!player)
        fail("PLAYER_NOT_IN_GAME", "This user is not in the game.")

    player.ready = false

    const returnValue = getGameForPlayer(game.id, userId)
    return structuredClone(returnValue)
}


export const fireShot = (gameId, userId, row, col) => {
    const game = games.get(normalizeGameId(gameId))
    if (!game)
        fail("GAME_NOT_FOUND", "Game was not found.")
    if (game.phase !== "battle")
        fail("BATTLE_NOT_ACTIVE", "The battle is not active.")

    const player = game.players.find(player => player.id === userId)
    if (!player)
        fail("PLAYER_NOT_IN_GAME", "This user is not in the game.")
    if (game.turnPlayerId !== userId)
        fail("TURN_MISMATCH", "It is not your turn.")

    if (!Number.isInteger(row) || !Number.isInteger(col) ||
        row < 0 || row >= BOARD_SIZE ||
        col < 0 || col >= BOARD_SIZE)
        fail("INVALID_SHOT_COORDINATES", "Shot row and col must be between 0 and 9.")

    if (player.shots.some(shot => shot.row === row && shot.col === col))
        fail("SHOT_DUPLICATE", "You have already fired at this cell.")


    const opponent = game.players.find(player => player.id !== userId)
    // Find the opponent's ship on the board that contains a cell that was shot.
    const oppsShip = opponent.ships.find(ship =>
        ship.cells.some(cell => cell.row === row && cell.col === col)
    )

    // Predefine shot as a miss
    const shot = {row, col, result: "miss"}

    if (oppsShip) {
        // Find the cell that was shot
        const cell = oppsShip.cells.find(cell => cell.row === row && cell.col === col)
        cell.hit = true
        // Check if the ship has more cells to hit or if it must sink now
        shot.result = oppsShip.cells.every(cell => cell.hit) ? "sunk" : "hit"

        if (shot.result === "sunk") {
            shot.cells = oppsShip.cells.map( ({ row, col }) => ({row, col}))
        }

        if (opponent.ships.every(ship => ship.cells.every(cell => cell.hit))) {
            game.phase = "finished"
            game.winnerPlayerId = userId
            game.turnPlayerId = null
        }
    } else {
        game.turnPlayerId = opponent.id
    }

    // Each player stores their outgoing shots, including misses.
    player.shots.push(shot)

    return structuredClone({
        ...shot,
        playerId: userId,
        opponentId: opponent.id,
        phase: game.phase,
        turnPlayerId: game.turnPlayerId,
        winnerPlayerId: game.winnerPlayerId,
    })
}


export const getGame = (gameId) => {
    const game = games.get(normalizeGameId(gameId))
    if (!game) fail("GAME_NOT_FOUND", "Game was not found")
    return structuredClone(game)
}


export const getGames = () => {
    return structuredClone(Array.from(games.values()))
}


export const getGameForPlayer = (gameId, userId) => {
    const game = games.get(normalizeGameId(gameId))
    if (!game)
        fail("GAME_NOT_FOUND", "Game was not found")

    const player = game.players.find(player => player.id === userId)
    if (!player)
        fail("PLAYER_NOT_IN_GAME", "This user is not in the game")

    const opponent = game.players.find(player => player.id !== userId)

    const view = {
        id: game.id,
        phase: game.phase,
        players: {
            you: {
                id: player.id,
                name: player.name,
                ready: player.ready,
                ships: player.ships,
                shots: player.shots,
            },
            opponent: opponent ? {
                id: opponent.id,
                name: opponent.name,
                shots: opponent.shots,
                ready: opponent.ready,
            } : null,
        },
        turnPlayerId: game.turnPlayerId,
        winnerPlayerId: game.winnerPlayerId,
    }

    return structuredClone(view)
}
