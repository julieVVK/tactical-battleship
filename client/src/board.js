import { BOARD_SIZE, SHIPS_CONFIG } from "./constants.js";

export function createBoard() {
    return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
}

export function boardFromShips(ships) {
    const board = createBoard();
    for (const ship of ships) {
        for (const cell of ship.cells) {
            board[cell.row][cell.col] = ship.id;
        }
    }
    return board;
}

export function shipCells(row, col, size, vertical) {
    const cells = [];
    for (let i = 0; i < size; i++) {
        if (vertical) cells.push({ row: row + i, col });
        else cells.push({ row, col: col + i });
    }
    return cells;
}

export function canPlaceShip(board, ship, row, col, blockedCells = []) {
    const cells = shipCells(row, col, ship.size, ship.vertical);
    for (const cell of cells) {
        if (cell.row < 0 || cell.row >= BOARD_SIZE || cell.col < 0 || cell.col >= BOARD_SIZE) {
            return false;
        }

        if (blockedCells.some((blocked) => blocked.row === cell.row && blocked.col === cell.col)) {
            return false;
        }

        for (let r = cell.row - 1; r <= cell.row + 1; r++) {
            for (let c = cell.col - 1; c <= cell.col + 1; c++) {
                if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) continue;

                const id = board[r][c];
                if (id !== null && id !== ship.id) return false;
            }
        }
    }
    return true;
}

export function placeShip(board, ship, row, col) {
    const nextBoard = board.map((line) => line.slice());
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (nextBoard[r][c] === ship.id) nextBoard[r][c] = null;
        }
    }
    for (const cell of shipCells(row, col, ship.size, ship.vertical)) {
        nextBoard[cell.row][cell.col] = ship.id;
    }
    return nextBoard;
}

export function randomBoard() {
    // Start over if a fleet gets stuck with no room for the next ship.
    while (true) {
        let board = createBoard();
        let placed = 0;

        for (const config of SHIPS_CONFIG) {
            for (let attempt = 0; attempt < 100; attempt++) {
                const row = Math.floor(Math.random() * BOARD_SIZE);
                const col = Math.floor(Math.random() * BOARD_SIZE);
                const ship = { ...config, vertical: Math.random() < 0.5 };

                if (canPlaceShip(board, ship, row, col)) {
                    board = placeShip(board, ship, row, col);
                    placed++;
                    break;
                }
            }
        }

        if (placed === SHIPS_CONFIG.length) return board;
    }
}

export function getShip(board, id) {
    const config = SHIPS_CONFIG.find((ship) => ship.id === id);
    const cells = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (board[row][col] === id) cells.push({ row, col });
        }
    }

    return {
        ...config,
        row: cells[0].row,
        col: cells[0].col,
        vertical: cells.length > 1 && cells[0].col === cells[1].col,
    };
}

export function pointerCell(event, grid) {
    const rect = grid.getBoundingClientRect();
    const cellWidth = grid.clientWidth / BOARD_SIZE;
    const cellHeight = grid.clientHeight / BOARD_SIZE;
    const row = Math.floor((event.clientY - rect.top - grid.clientTop) / cellHeight);
    const col = Math.floor((event.clientX - rect.left - grid.clientLeft) / cellWidth);
    return { row, col };
}
