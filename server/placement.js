// File was created by Vladyslav Doroshenko

import {BOARD_SIZE, FLEET_SIZES} from "./rules.js";


/* ============================- RESPONSE FROM BACKEND: -============================ */
// board<Object> is passed from readyPlayer() from ./games.js

// {
//     "gameId": "A1B2C3",
//     "userId": "alice",

//     "board": [
//     ["battleship-4", "battleship-4", "battleship-4", "battleship-4", null, null, "cruiser-3-1", "cruiser-3-1", "cruiser-3-1", null],

//     [null, null, null, null, null, null, null, null, null, null],

//     ["cruiser-3-2", "cruiser-3-2", "cruiser-3-2", null, null, null, "destroyer-2-1", "destroyer-2-1", null, null],

//     [null, null, null, null, null, null, null, null, null, null],

//     ["destroyer-2-2", "destroyer-2-2", null, null, null, null, "destroyer-2-3", "destroyer-2-3", null, null],

//     [null, null, null, null, null, null, null, null, null, null],

//     ["boat-1-1", null, null, null, null, null, "boat-1-2", null, null, null],

//     [null, null, null, null, null, null, null, null, null, null],

//     ["boat-1-3", null, null, null, null, null, "boat-1-4", null, null, null],

//     [null, null, null, null, null, null, null, null, null, null]
// ]
// }
/* ============================- RESPONSE FROM BACKEND: -============================ */


/* ============================- SHIP MAP -============================ */
// > KEY: battleship-4
// > VALUE: {
//             cells: [
//                 { row: 0, col: 0, hit: false },
//                 { row: 0, col: 1, hit: false },
//                 { row: 0, col: 2, hit: false },
//                 { row: 0, col: 3, hit: false }
//             ]
// }

// > KEY: destroyer-2-1
// > VALUE: {
//             cells: [
//                 { row: 2, col: 6, hit: false },
//                 { row: 2, col: 7, hit: false } ]
// }

// > KEY: destroyer-2-2
// > VALUE: {
//             cells: [
//                 { row: 4, col: 0, hit: false },
//                 { row: 4, col: 1, hit: false } ]
// }
/* ============================- SHIP MAP -============================ */


export const prepareFleet = (board) => {
    const shipDepo = new Map()

    if (!Array.isArray(board)) return {error: "board matrix contain at least 1 non array item"};
    if (board.length !== BOARD_SIZE) return {error: "board matrix has invalid size"};

    for (let i = 0; i < board.length; i++) {
        if (!Array.isArray(board[i])) return {error: "board matrix cell is not an array"};
        if (board[i].length !== BOARD_SIZE) return {error: "board matrix cell has invalid size"};
    }

    for (const [i, row] of board.entries()) {
        for (const [j, cell] of row.entries()) {
            if (cell !== null){
                const key = cell;
                if (typeof key !== "string" || key?.length < 1) return {error: "board matrix cell contains invalid value"};

                if (!shipDepo.has(key)) {
                    shipDepo.set(key, {cells: []});
                }
                shipDepo.get(key).cells.push({row: i, col: j, hit: false});
            }
        }
    }

    const tempArray = []
    for (const [key, value] of shipDepo.entries()){
        tempArray.push(value.cells.length)
    }
    tempArray.sort((a, b) => b - a);

    for(let i = 0; i < FLEET_SIZES.length; i++){
        if (tempArray[i] !== FLEET_SIZES[i]){
            return {error: "fleet has invalid size"};
        }
    }

    const fleet = Array.from(shipDepo.values());
    if (fleet.length !== 10) return {error: "fleet has invalid size"};

    return fleet;
};
