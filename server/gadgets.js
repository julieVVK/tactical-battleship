import {BOARD_SIZE} from "./rules.js"
import fail from "./error.js"


function checkCoordinates(row, col) {
    if (!Number.isInteger(row) || !Number.isInteger(col) ||
        row < 0 || row >= BOARD_SIZE ||
        col < 0 || col >= BOARD_SIZE) {
        fail("INVALID_GADGET_TARGET", "Choose a cell inside the board.")
    }
}


export function scanArea(player, opponent, row, col) {
    checkCoordinates(row, col)
    const scannedZones = []

    for (let r = Math.max(0, row - 1); r <= Math.min(BOARD_SIZE - 1, row + 1); r++) {
        for (let c = Math.max(0, col - 1); c <= Math.min(BOARD_SIZE - 1, col + 1); c++) {
            const hasShip = opponent.ships.some(ship =>
                ship.cells.some(cell => cell.row === r && cell.col === c)
            )
            scannedZones.push({row: r, col: c, hasShip})
        }
    }

    player.scannedZones = scannedZones
}


export function placeMine(player, opponent, row, col) {
    checkCoordinates(row, col)
    if (player.ships.some(ship => ship.cells.some(cell => cell.row === row && cell.col === col)))
        fail("INVALID_GADGET_TARGET", "Place the mine on water.")

    if (opponent.shots.some(shot => shot.row === row && shot.col === col))
        fail("INVALID_GADGET_TARGET", "This cell has already been shot.")

    player.mine = {row, col, triggered: false}
}


export function relocateShip(player, opponent, {oldRow, oldCol, newRow, newCol, isVertical}) {
    checkCoordinates(oldRow, oldCol)
    checkCoordinates(newRow, newCol)
    if (typeof isVertical !== "boolean")
        fail("INVALID_GADGET_TARGET", "Choose a ship orientation.")

    const ship = player.ships.find(ship =>
        ship.cells.some(cell => cell.row === oldRow && cell.col === oldCol)
    )

    if (!ship || ship.cells.some(cell => cell.hit))
        fail("INVALID_GADGET_TARGET", "Choose an undamaged ship.")

    const newCells = []
    for (let i = 0; i < ship.cells.length; i++) {
        const row = newRow + (isVertical ? i : 0)
        const col = newCol + (isVertical ? 0 : i)
        checkCoordinates(row, col)

        if (opponent.shots.some(shot => shot.row === row && shot.col === col))
            fail("INVALID_GADGET_TARGET", "The ship cannot move onto a shot cell.")

        if (player.mine?.row === row && player.mine.col === col)
            fail("INVALID_GADGET_TARGET", "The ship cannot move onto a mine.")


        if (player.ships.some(other => other !== ship && other.cells.some(cell =>
            Math.abs(cell.row - row) <= 1 && Math.abs(cell.col - col) <= 1)))
        {
            fail("INVALID_GADGET_TARGET", "Ships must not overlap or touch.")
        }


        newCells.push({row, col, hit: false})
    }

    if (newCells.every(cell => ship.cells.some(old => old.row === cell.row && old.col === cell.col)))
        fail("INVALID_GADGET_TARGET", "Move the ship to a different position.")

    ship.cells = newCells
}
