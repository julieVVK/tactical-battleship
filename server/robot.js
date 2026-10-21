/**
 * @file robot.js
 * @description Robot opponent logic. The robot picks random cells to shoot at until it hits a player's ship.
 * Then the robot chooses a random neighbour cell to the one it hit. If it hits that cell too, it can determine 
 * the direction of the ship and make further shooting decisions based on that. When a ship is sunk, 
 * the robot removes the targets and remembered hits belonging to that ship.
 * @author Marie Pindorová
*/

import { BOARD_SIZE, FLEET_SIZES } from "./rules.js";
import { prepareFleet } from "./placement.js";

/**
 * Generates a random fleet for the robot.
 * @returns {Array<{cells: Array<{row: number, col: number, hit: boolean}>}>}
 * The robot's fleet in the same format used by the game logic
 */
export function generateRobotFleet() {
    // try generating a complete fleet until a valid placement is found
    while (true) {
        // start with an empty 10x10 game board
        const board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));

        // keep track of cells occupied by ships
        const occupied = new Set();

        let placementFailed = false;

        // place the longest ships first
        for (const [index, shipSize] of FLEET_SIZES.entries()) {
            const shipLabel = `robot-ship-${index}`;
            let placed = false;

            // try random positions until this ship fits
            for (let attempt = 0; attempt < 1000; attempt++) {
                const horizontal = Math.random() < 0.5;

                const row = Math.floor(Math.random() * BOARD_SIZE);
                const col = Math.floor(Math.random() * BOARD_SIZE);

                const cells = [];

                for (let offset = 0; offset < shipSize; offset++) {
                    const cellRow = row + (horizontal ? 0 : offset);
                    const cellCol = col + (horizontal ? offset : 0);

                    cells.push({ row: cellRow, col: cellCol });
                }

                // check that every ship cell is inside the board and has no neighbouring occupied cells
                const canPlace = cells.every(cell => {
                    // reject the position if any part of the ship is outside the board
                    if (cell.row < 0 || cell.row >= BOARD_SIZE || cell.col < 0 || cell.col >= BOARD_SIZE) {
                        return false;
                    }

                    for (let r = cell.row - 1; r <= cell.row + 1; r++) {
                        for (let c = cell.col - 1; c <= cell.col + 1; c++) {
                            if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) {
                                continue;
                            }

                            if (occupied.has(`${r},${c}`)) {
                                return false;
                            }
                        }
                    }

                    return true;
                });

                if (!canPlace) {
                    continue;
                }

                // the position is valid, so save this ship on the board
                for (const cell of cells) {
                    board[cell.row][cell.col] = shipLabel;
                    occupied.add(`${cell.row},${cell.col}`);
                }

                placed = true;
                break;
            }

            // if one ship could not be placed, restart with a new board
            if (!placed) {
                placementFailed = true;
                break;
            }
        }

        if (placementFailed) {
            continue;
        }

        // convert the board into the exact ship format 
        const fleet = prepareFleet(board);

        if (!fleet.error) {
            return fleet;
        }
    }
}

// collection of robot states for each game. key: gameId, value: the robot's state for the game
const robotStates = new Map();

/**
 * Gets the robot's state for a game, creates it if necessary.
 * 
 * @param {number} gameId - ID of the game
 * @returns {{targets: Array<{row: number, col: number}>, knownHits: Array<{row: number, col: number}>}} 
 * The mutable state object belonging to this game
 */
function getRobotState(gameId) {
    if (!robotStates.has(gameId)) {
        robotStates.set(gameId, {
            targets: [],    // cells that the robot intends to shoot next
            knownHits: []   // coordinates where the robot has hit a ship
        });
    }

    return robotStates.get(gameId);
}

/**
 * Checks whether the cell is inside the game board.
 * 
 * @param {number} row - board row
 * @param {number} col - board column
 * @returns {boolean} - true if the cell is inside the board, otherwise false
*/
function isInsideBoard(row, col) {
    return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

/**
 * Checks whether the robot has already fired at a given cell.
 * 
 * @param {Array<{row: number, col: number}>} shots - previous shots
 * @param {number} row - row index
 * @param {number} col - column index
 * @returns {boolean} - true if the cell was already shot at
*/
function hasAlreadyShot(shots, row, col) {
    return shots.some(shot => shot.row === row && shot.col === col);
}

/**
 * Chooses a random cell.
 * 
 * @param cells - all cells on the game board
 * @returns {{row: number, col: number}|undefined} - the selected cell
*/
function chooseRandomCell(cells) {
    const randomIndex = Math.floor(Math.random() * cells.length);

    return cells[randomIndex];
}

/**
 * Chooses the robot's next shot. The function first tries an available neighbour.
 * If there are no available neighbours, it chooses any unshot cell on the board.
 * 
 * @param {Array<{row: number, col: number}>} shots - previous shots
 * @param {Array<{row: number, col: number}>} neighbours - cells next to a previous hit that the robot should try before returning to random shooting
 * @returns {{row: number, col: number}|null} - the chosen cell or null if every cell has already been shot at
*/
export function chooseRobotShot(shots, neighbours = []) {
    // keep only neighbours that are inside the game board and have not already been shot at
    const availableNeighbours = neighbours.filter(cell => isInsideBoard(cell.row, cell.col) && !hasAlreadyShot(shots, cell.row, cell.col));

    // if there are available neighbours, choose one randomly
    if (availableNeighbours.length > 0) {
        return chooseRandomCell(availableNeighbours);
    }

    // otherwise, collect every cell that has not been shot at
    const availableCells = [];

    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (!hasAlreadyShot(shots, row, col)) {
                availableCells.push({row, col}); // add the cell to the end of the array
            }
        }
    }

    // no cells left - game over
    if (availableCells.length === 0) {
        return null;
    }

    // choose a remaining cell randomly
    return chooseRandomCell(availableCells);
}

/**
 * Finds all unshot cells directly next to a previous hit.
 * 
 * @param {Array<{row: number, col: number}>} shots - previous shots
 * @param {number} row - row index
 * @param {number} col - column index
 * @returns {Array<{row: number, col: number}>} - valid, unshot neighbours
 */
export function getAvailableNeighbours(shots, row, col) {
    // the four possible neighbours
    const neighbours = [
        { row: row - 1, col: col }, // up
        { row: row + 1, col: col }, // down
        { row: row, col: col - 1 }, // left
        { row: row, col: col + 1 }  // right
    ];

    // keep only cells inside the board that have not been shot at
    return neighbours.filter(cell =>
        isInsideBoard(cell.row, cell.col) &&
        !hasAlreadyShot(shots, cell.row, cell.col)
    );
}

/**
 * Gets a copy of the robot's current target cells for a game.
 * 
 * @param {number} gameId - ID of the game
 * @returns {Array<{row: number, col: number}>} - a copy of the targets
 */
export function getRobotTargets(gameId) {
    const state = getRobotState(gameId);
    
    return state.targets.map(target => ({...target}));
}

/**
 * Updates the robot's memory after its shot has been processed.
 * 
 * @param {number} gameId - ID of the game
 * @param {{row: number, col: number, result: string}} shot - shot result
 * @param {Array<{row: number, col: number}>} shots - robot's complete shot history
 * @returns {void} - no return value
 */
export function updateRobotAfterShot(gameId, shot, shots) {
    const state = getRobotState(gameId);

    // remove targets that have already been shot at
    state.targets = state.targets.filter(target => !hasAlreadyShot(shots, target.row, target.col));

    if (shot.result === "hit" || shot.result === "sunk") {
        // remember the location of a given hit
        state.knownHits.push({ row: shot.row, col: shot.col });

        // check whether another known hit is directly left or right from this one 
        // (both cells in the same row, columns exactly one apart)
        const horizontalHit = state.knownHits.some(hit => hit.row === shot.row && Math.abs(hit.col - shot.col) === 1);

        // check whether another known hit is directly up or down from this one 
        // (both cells in the same column, rows exactly one apart)
        const verticalHit = state.knownHits.some(hit => hit.col === shot.col && Math.abs(hit.row - shot.row) === 1);

        // find unshot neighbours of the newly hit cell
        let neighbours = getAvailableNeighbours(shots, shot.row, shot.col);

        // if the ship is located horizontally, prioritize cells in the same row
        if (horizontalHit) {
            neighbours = neighbours.filter(cell => cell.row === shot.row);
        }

        // if the ship is located vertically, prioritize cells in the same column
        if (verticalHit) {
            neighbours = neighbours.filter(cell => cell.col === shot.col);
        }

        // add new neighbours
        for (const neighbour of neighbours) {
            const alreadyTargeted = state.targets.some(target => target.row === neighbour.row && target.col === neighbour.col);

            if (!alreadyTargeted) {
                state.targets.push(neighbour);
            }
        }
    }

    if (shot.result === "sunk") {
        const sunkCells = shot.cells || [];

        // remove targets that belong to the sunk ship
        state.targets = state.targets.filter(target => !sunkCells.some(cell => cell.row === target.row && cell.col === target.col));

        // remove remembered hits that belong to the sunk ship
        state.knownHits = state.knownHits.filter(hit => !sunkCells.some(cell => cell.row === hit.row && cell.col === hit.col)); 
    }
}

/**
 * Deletes the robot's stored state for a game.
 * 
 * @param {number} gameId - ID of the game to reset
 * @returns {void} - no return value
 */
export function resetRobot(gameId) {
    robotStates.delete(gameId);
}
