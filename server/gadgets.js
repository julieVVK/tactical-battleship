import {BOARD_SIZE} from "./rules.js"
import {prepareFleet} from "./placement.js"
import fail from "./error.js"


export const scanArea = (player, opponent, row, col) => {
    const cells = []

    for (const ship of opponent.ships) {
        for (const cell of ship.cells) {
            if (Math.abs(cell.row - row) <= 1 &&
                Math.abs(cell.col - col) <= 1 && !cell.hit) {
                cells.push({row: cell.row, col: cell.col})
            }
        }
    }

    player.radar = {row, col, cells}
}


export const placeMine = (player, opponent, row, col) => {
    for (const ship of player.ships) {
        if (ship.cells.some(cell => cell.row === row && cell.col === col)) {
            fail("INVALID_GADGET_TARGET", "Place the mine on water.")
        }
    }

    if (opponent.shots.some(shot => shot.row === row && shot.col === col)) {
        fail("INVALID_GADGET_TARGET", "This cell has already been shot.")
    }

    player.mine = {row, col, triggered: false}
}


export const relocateShip = (player, opponent, shipId, row, col, vertical) => {
    const ship = player.ships.find(ship => ship.id === shipId)

    if (!ship || ship.cells.some(cell => cell.hit)) {
        fail("INVALID_GADGET_TARGET", "Choose an undamaged ship.")
    }

    const newCells = []
    for (let i = 0; i < ship.cells.length; i++) {
        let r = row
        let c = col
        if (vertical) r += i
        else c += i

        if (r >= BOARD_SIZE || c >= BOARD_SIZE) {
            fail("INVALID_GADGET_TARGET", "The ship must fit inside the board.")
        }

        if (opponent.shots.some(shot => shot.row === r && shot.col === c)) {
            fail("INVALID_GADGET_TARGET", "The ship cannot move onto a shot cell.")
        }

        if (player.mine && player.mine.row === r && player.mine.col === c) {
            fail("INVALID_GADGET_TARGET", "The ship cannot move onto a mine.")
        }

        newCells.push({row: r, col: c, hit: false})
    }

    // Validate a copy before changing the real ship.
    const board = Array.from({length: BOARD_SIZE}, () => Array(BOARD_SIZE).fill(null))
    for (const other of player.ships) {
        if (other.id === shipId) continue

        for (const cell of other.cells) {
            board[cell.row][cell.col] = other.id
        }
    }

    for (const cell of newCells) {
        if (board[cell.row][cell.col] !== null) {
            fail("INVALID_GADGET_TARGET", "Another ship is in the way.")
        }
        board[cell.row][cell.col] = shipId
    }

    const fleet = prepareFleet(board)
    if (fleet.error) fail("INVALID_GADGET_TARGET", fleet.error)

    ship.cells = newCells
}
