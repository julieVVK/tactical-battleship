// File was created by Vladyslav Doroshenko

// Only this module changes stored games. Public functions return copies.

import {randomBytes} from "node:crypto"
import {getUser} from "./users.js"
import {prepareFleet} from "./placement.js"
import {BOARD_SIZE} from "./rules.js"
import fail from "./error.js"
import {scanArea, placeMine, relocateShip} from "./gadgets.js"


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
        usedGadgets: [],
        radar: null,
        mine: null,
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


const hitCell = (game, player, opponent, row, col) => {
    const ship = opponent.ships.find(ship =>
        ship.cells.some(cell => cell.row === row && cell.col === col)
    )
    const shot = {row, col, result: "miss"}

    if (ship) {
        const cell = ship.cells.find(cell => cell.row === row && cell.col === col)
        cell.hit = true
        shot.result = "hit"

        if (ship.cells.every(cell => cell.hit)) {
            shot.result = "sunk"
            shot.cells = ship.cells.map(cell => ({row: cell.row, col: cell.col}))

            // Ships cannot touch, so surrounding cells are known water.
            for (const cell of ship.cells) {
                for (let r = cell.row - 1; r <= cell.row + 1; r++) {
                    for (let c = cell.col - 1; c <= cell.col + 1; c++) {
                        if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) continue
                        if (ship.cells.some(part => part.row === r && part.col === c)) continue
                        if (player.shots.some(previous => previous.row === r && previous.col === c)) continue

                        player.shots.push({row: r, col: c, result: "blocked"})
                    }
                }
            }
        }

        if (opponent.ships.every(ship => ship.cells.every(cell => cell.hit))) {
            game.phase = "finished"
            game.winnerPlayerId = player.id
            game.turnPlayerId = null
        }
    }

    player.shots.push(shot)
    return shot
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
    const shot = hitCell(game, player, opponent, row, col)

    const mine = opponent.mine
    if (mine && !mine.triggered && mine.row === row && mine.col === col) {
        mine.triggered = true
        shot.result = "mine"

        // A mine hits one random undamaged cell of the attacker's fleet.
        const targets = []
        for (const ship of player.ships) {
            for (const cell of ship.cells) {
                if (!cell.hit) targets.push(cell)
            }
        }

        const target = targets[Math.floor(Math.random() * targets.length)]
        hitCell(game, opponent, player, target.row, target.col)
    }

    if (game.phase === "battle" && (shot.result === "miss" || shot.result === "mine")) {
        game.turnPlayerId = opponent.id
    }

    // is this the right way to return the shot?
    return structuredClone({
        ...shot,
        playerId: userId,
        opponentId: opponent.id,
        phase: game.phase,
        turnPlayerId: game.turnPlayerId,
        winnerPlayerId: game.winnerPlayerId,
    })
}


export const useGadget = (gameId, userId, gadget, row, col, shipId, vertical) => {
    const game = games.get(normalizeGameId(gameId))
    if (!game)
        fail("GAME_NOT_FOUND", "Game not found.")

    const player = game.players.find(player => player.id === userId)
    if (!player)
        fail("PLAYER_NOT_IN_GAME", "This user is not in the game.")
    if (game.phase !== "battle")
        fail("BATTLE_NOT_ACTIVE", "The battle is not active.")
    if (game.turnPlayerId !== userId)
        fail("TURN_MISMATCH", "It is not your turn.")

    if (gadget !== "radar" && gadget !== "mine" && gadget !== "relocate")
        fail("INVALID_GADGET", "Unknown gadget.")
    if (player.usedGadgets.includes(gadget))
        fail("GADGET_ALREADY_USED", "You have already used this gadget.")

    if (!Number.isInteger(row) || !Number.isInteger(col) ||
        row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE)
        fail("INVALID_GADGET_TARGET", "Choose a cell inside the board.")

    const opponent = game.players.find(player => player.id !== userId)

    if (gadget === "radar") {
        scanArea(player, opponent, row, col)
    } else if (gadget === "mine") {
        placeMine(player, opponent, row, col)
    } else {
        if (typeof vertical !== "boolean")
            fail("INVALID_GADGET_TARGET", "Choose a ship orientation.")

        relocateShip(player, opponent, shipId, row, col, vertical)
    }

    player.usedGadgets.push(gadget)
    return getGameForPlayer(game.id, userId)
}


export const leaveGame = (gameId, userId) => {
    const game = games.get(normalizeGameId(gameId))
    if (!game)
        fail("GAME_NOT_FOUND", "Game not found.")
    if (!game.players.some(player => player.id === userId))
        fail("PLAYER_NOT_IN_GAME", "This user is not in the game.")

    if (game.phase === "battle") {
        const opponent = game.players.find(player => player.id !== userId)
        game.phase = "finished"
        game.winnerPlayerId = opponent.id
        game.turnPlayerId = null
    } else if (game.phase === "waiting" || game.phase === "placement") {
        game.phase = "cancelled"
    }

    return getGameForPlayer(game.id, userId)
}


export const createRobotGame = (userId) => {
    const created = createGame(userId)
    const game = games.get(created.id)
    const robot = makePlayer({id: "computer-" + game.id, name: "Computer"})

    // One fixed legal fleet is enough for this example opponent.
    const board = Array.from({length: BOARD_SIZE}, () => Array(BOARD_SIZE).fill(null))
    const positions = [
        [0, 0, 4], [0, 6, 3], [2, 0, 3], [2, 6, 2], [4, 0, 2],
        [4, 6, 2], [6, 0, 1], [6, 6, 1], [8, 0, 1], [8, 6, 1],
    ]

    for (let i = 0; i < positions.length; i++) {
        const [row, col, size] = positions[i]
        for (let offset = 0; offset < size; offset++) {
            board[row][col + offset] = "computer-ship-" + i
        }
    }

    robot.ships = prepareFleet(board)
    robot.ready = true
    robot.isRobot = true
    game.players.push(robot)
    game.phase = "placement"

    return getGameForPlayer(game.id, userId)
}


export const playRobotTurn = (gameId) => {
    const game = games.get(normalizeGameId(gameId))
    const robot = game.players.find(player => player.isRobot)
    if (!robot) return

    // Hits keep the turn. Stop after a miss or the end of the match.
    while (game.phase === "battle" && game.turnPlayerId === robot.id) {
        const availableCells = []

        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                const alreadyShot = robot.shots.some(shot => shot.row === row && shot.col === col)
                if (!alreadyShot) availableCells.push({row, col})
            }
        }

        const cell = availableCells[Math.floor(Math.random() * availableCells.length)]
        fireShot(game.id, robot.id, cell.row, cell.col)
    }
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
                usedGadgets: player.usedGadgets,
                radar: player.radar,
                mine: player.mine,
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
