// File was created by Vladyslav Doroshenko

// Only this module changes stored games. Public functions return copies.

import {randomBytes} from "node:crypto"
import {getUser} from "./users.js"
import {prepareFleet} from "./placement.js"
import {BOARD_SIZE} from "./rules.js"
import {scanArea, placeMine, relocateShip} from "./gadgets.js"
import {generateRobotFleet, resetRobot, chooseRobotShot, getRobotTargets, updateRobotAfterShot} from "./robot.js";
import fail from "./error.js"


/* ==========- GAME OBJECT -========== */
// const game = {
//     id: gameId,
//     phase: "placement",
//     players: [makePlayer(user), robot],
//     turnPlayerId: null,
//     winnerPlayerId: null,
//     robotPlayerId: robotId
// };
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
        scannedZones: [],
        mine: null,
    }
}
/* ==========- PLAYER OBJECT -========== */


const games = new Map()


const normalizeGameId = (gameId) => {
    if (typeof gameId !== 'string' || !/^[A-Fa-f0-9]{6}$/.test(gameId.trim()))
        fail('INVALID_GAME_ID', 'Enter a six-character game code.')

    return gameId.trim().toUpperCase()
}


/**
 * Creates a game ID and user and robot players, generates robot's fleet
 * @author Marie Pindorová
 * @param {string} userId
 * @returns {Object} the created game
 */
export const createRobotGame = (userId) => {
    const user = getUser(userId);
    if (!user) {
        fail("USER_NOT_FOUND", "User not found.");
    }

    const gameId = makeGameId();

    const robotId = `robot-${gameId}`;

    const robot = {
        ...makePlayer({
            id: robotId, name: "Robot"
        }), ready: true, ships: generateRobotFleet()
    }

    const game = {
        id: gameId,
        phase: "placement",
        players: [makePlayer(user), robot],
        turnPlayerId: null,
        winnerPlayerId: null,
        robotPlayerId: robotId
    };

    resetRobot(gameId);

    games.set(game.id, game);

    return structuredClone(game);
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
    if (fleet.error)
        fail("INVALID_FLEET", fleet.error)

    player.ships = fleet
    player.ready = true

    if (game.players.length === 2 && game.players.every(player => player.ready)) {
        game.phase = "battle"

        // the user starts in games against the robot
        if (game.robotPlayerId) {
            game.turnPlayerId = game.players.find(player => player.id !== game.robotPlayerId).id;
        } else {
            game.turnPlayerId = game.players[Math.floor(Math.random() + 0.5)].id
        }
    }

    const returnValue = getGameForPlayer(game.id, userId)
    return structuredClone(returnValue)
}


const makeGameId = () => {
    let gameId

    do {
        gameId = randomBytes(3).toString('hex').toUpperCase()
    } while (games.has(gameId))

    return gameId
}


export const createGame = (userId) => {
    const user = getUser(userId)
    if (!user)
        fail('USER_NOT_FOUND', 'User not found.')

    const game = {
        id: makeGameId(),
        phase: 'waiting',
        players: [makePlayer(user)],
        turnPlayerId: null,
        winnerPlayerId: null,
    }

    games.set(game.id, game)
    return structuredClone(game)
}


/**
 * @author Marie Pindorová
 * @param {string} gameId
 * @returns {void}
 *
 * Automatically plays the robot turn.
 */
// robot's automatic turn
export const playRobotTurn = (gameId) => {
    const game = games.get(normalizeGameId(gameId));

    if (!game || !game.robotPlayerId || game.phase !== "battle") {
        return;
    }

    const robot = game.players.find(player => player.id === game.robotPlayerId);

    if (!robot) {
        return;
    }

    // shoot while it is the robot's turn
    while (game.phase === "battle" && game.turnPlayerId === robot.id) {
        // choose a target using the robot's remembered targets
        const shot = chooseRobotShot(robot.shots, getRobotTargets(game.id));

        // stop if no available cells remain
        if (!shot) {
            break;
        }

        // fire the shot
        const result = fireShot(game.id, robot.id, shot.row, shot.col);

        // update the robot's targeting strategy
        updateRobotAfterShot(game.id, result, robot.shots);
    }
};


export const unreadyPlayer = (gameId, userId) => {
    const game = games.get(normalizeGameId(gameId))
    if (!game)
        fail('GAME_NOT_FOUND', 'Game not found.')

    if (game.phase !== 'waiting' && game.phase !== 'placement')
        fail('SHIP_PLACEMENT_CLOSED', 'The battle has already started.')

    const player = game.players.find(player => player.id === userId)
    if (!player)
        fail('PLAYER_NOT_IN_GAME', 'This user is not in the game.')

    player.ready = false

    const returnValue = getGameForPlayer(game.id, userId)
    return structuredClone(returnValue)
}


const hitCell = (game, player, opponent, row, col) => {
    const ship = opponent.ships.find(ship => ship.cells.some(cell => cell.row === row && cell.col === col))
    const shot = {row, col, result: "miss"}

    if (ship) {
        ship.cells.find(cell => cell.row === row && cell.col === col).hit = true
        shot.result = ship.cells.every(cell => cell.hit) ? "sunk" : "hit"

        if (shot.result === "sunk") {
            shot.cells = ship.cells.map(({row, col}) => ({row, col}))
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
        fail('GAME_NOT_FOUND', 'Game was not found.')


    if (game.phase !== 'battle')
        fail('BATTLE_NOT_ACTIVE', 'The battle is not active.')


    const player = game.players.find(player => player.id === userId)
    if (!player)
        fail('PLAYER_NOT_IN_GAME', 'This user is not in the game.')


    if (game.turnPlayerId !== userId)
        fail('TURN_MISMATCH', 'It is not your turn.')


    if (!Number.isInteger(row) || !Number.isInteger(col) ||
        row < 0 || row >= BOARD_SIZE ||
        col < 0 || col >= BOARD_SIZE)
    {
        fail('INVALID_SHOT_COORDINATES', 'Shot row and col must be between 0 and 9.')
    }


    if (player.shots.some(shot => shot.row === row && shot.col === col))
        fail('SHOT_DUPLICATE', 'You have already fired at this cell.')


    const opponent = game.players.find(player => player.id !== userId)
    const shot = hitCell(game, player, opponent, row, col)

    if (opponent.mine && !opponent.mine.triggered && opponent.mine.row === row && opponent.mine.col === col) {
        opponent.mine.triggered = true
        shot.mineTriggered = true

        const previous = opponent.shots.find(shot => shot.row === row && shot.col === col)
        let reflectedShot
        if (previous) {
            // A reflected shot cannot damage the same cell twice.
            reflectedShot = {
                row,
                col,
                result: previous.result,
                alreadyShot: true,
            }

            if (previous.cells)
                reflectedShot.cells = previous.cells
        } else {
            reflectedShot = hitCell(game, opponent, player, row, col)
            reflectedShot.source = "mine"
        }

        shot.reflectedShot = {
            ...reflectedShot,
            source: "mine",
            playerId: opponent.id,
            opponentId: player.id,
        }
    }

    if (game.phase === "battle" && shot.result === "miss")
        game.turnPlayerId = opponent.id

    return structuredClone({
        ...shot,
        playerId: userId,
        opponentId: opponent.id,
        phase: game.phase,
        turnPlayerId: game.turnPlayerId,
        winnerPlayerId: game.winnerPlayerId,
    })
}


export const useGadget = (gameId, userId, gadget, options = {}) => {
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

    if (!["radar", "mine", "relocate"].includes(gadget))
        fail("INVALID_GADGET", "Unknown gadget.")

    if (player.usedGadgets.includes(gadget))
        fail("GADGET_ALREADY_USED", "You have already used this gadget.")


    const opponent = game.players.find(player => player.id !== userId)
    if (gadget === "radar")
        scanArea(player, opponent, options.row, options.col)

    if (gadget === "mine")
        placeMine(player, opponent, options.row, options.col)

    if (gadget === "relocate")
        relocateShip(player, opponent, options)

    player.usedGadgets.push(gadget)
    return getGameForPlayer(game.id, userId)
}


export const getGame = (gameId) => {
    const game = games.get(normalizeGameId(gameId))
    if (!game)
        fail('GAME_NOT_FOUND', 'Game was not found')
    return structuredClone(game)
}


export const getGames = () => {
    return structuredClone(Array.from(games.values()))
}


export const getGameForPlayer = (gameId, userId) => {
    const game = games.get(normalizeGameId(gameId))
    if (!game)
        fail('GAME_NOT_FOUND', 'Game was not found')

    const player = game.players.find(player => player.id === userId)
    if (!player)
        fail('PLAYER_NOT_IN_GAME', 'This user is not in the game')

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
                scannedZones: player.scannedZones,
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
