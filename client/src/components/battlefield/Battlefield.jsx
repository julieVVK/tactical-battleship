// Board layout based on the UI by xhaziyh00 and xslobok00.
import { LETTERS, NUMBERS } from "../../constants.js";
import "./battlefield.css";

export default function Battlefield({
    title,
    board,
    shots = [],
    mine = null,
    radar = null,
    preview = null,
    radarTarget = null,
    selectedShipId = null,
    boardRef,
    disabled = false,
    onCellClick,
    onCellPointerDown,
    onCellHover,
    children,
}) {
    function moveFocus(event, row, col) {
        if (event.key === "ArrowUp") row--;
        else if (event.key === "ArrowDown") row++;
        else if (event.key === "ArrowLeft") col--;
        else if (event.key === "ArrowRight") col++;
        else return;

        event.preventDefault();
        const next = event.currentTarget.parentElement.querySelector(
            `[data-row="${row}"][data-col="${col}"]`,
        );
        if (next) next.focus();
    }

    function renderCell(row, col) {
        const shot = shots.find((shot) => shot.row === row && shot.col === col);
        const hit = shot && (shot.result === "hit" || shot.result === "sunk");
        const shipId = board[row][col];
        let className = "cell";

        if (shipId || hit) className += " ship-cell";
        if (shot?.result === "blocked") className += " blocked-cell";
        const scannedShip = radar?.cells.some(
            (cell) => cell.row === row && cell.col === col,
        );
        if (scannedShip && !shot) className += " scanned-ship";
        if (shipId && shipId === selectedShipId) className += " selected-ship";

        if (radar && Math.abs(row - radar.row) <= 1 && Math.abs(col - radar.col) <= 1) {
            className += " radar-cell";
        }
        if (
            radarTarget &&
            Math.abs(row - radarTarget.row) <= 1 &&
            Math.abs(col - radarTarget.col) <= 1
        ) {
            className += " radar-cell";
        }
        if (preview && preview.cells.some((cell) => cell.row === row && cell.col === col)) {
            if (preview.valid) className += " valid-placement";
            else className += " invalid-placement";
        }

        let status = "water";
        if (shipId || scannedShip) status = "ship";
        if (shot) status = shot.result;

        return (
            <button
                type="button"
                key={`${row}-${col}`}
                className={className}
                data-row={row}
                data-col={col}
                aria-label={`${LETTERS[row]}${col + 1}, ${status}`}
                disabled={disabled || shot?.result === "blocked"}
                onClick={() => onCellClick?.(row, col)}
                onPointerDown={(event) => onCellPointerDown?.(event, row, col)}
                onPointerEnter={() => onCellHover?.(row, col)}
                onKeyDown={(event) => moveFocus(event, row, col)}
            >
                {hit && <span className="hitCell">✕</span>}
                {shot && !hit && <span className="missCell">•</span>}
                {mine && !mine.triggered && mine.row === row && mine.col === col && (
                    <span className="mineIcon">💣</span>
                )}
            </button>
        );
    }

    return (
        <div className="mainField">
            <p className="owner">{title}</p>
            <div className="board-numbers">
                <div className="coords" />
                {NUMBERS.map((number) => (
                    <div
                        className="coords"
                        key={number}
                    >
                        {number}
                    </div>
                ))}
            </div>
            <div className="board-with-letters">
                <div>
                    {LETTERS.map((letter) => (
                        <div
                            className="coords"
                            key={letter}
                        >
                            {letter}
                        </div>
                    ))}
                </div>
                <div
                    className="grid-container"
                    ref={boardRef}
                    onPointerLeave={() => onCellHover?.(null, null)}
                >
                    {board.map((line, row) => line.map((cell, col) => renderCell(row, col)))}
                </div>
            </div>
            <div className="info">{children}</div>
        </div>
    );
}
