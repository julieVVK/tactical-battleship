import React from "react";
import Header from "../header/Header.jsx";
import Battlefield from "../battlefield/Battlefield.jsx";
import BattleShip from "../battleship/BattleShip.jsx";
import { SHIPS_CONFIG } from "../../constants.js";
import {
    createBoard,
    randomBoard,
    getShip,
    shipCells,
    canPlaceShip,
    placeShip,
    pointerCell,
} from "../../board.js";
import { readyPlayer, cancelReady } from "../../gameApi.js";
import "./battleshipGame.css";

export default class GetReady extends React.Component {
    constructor(props) {
        super(props);
        this.boardRef = React.createRef();
        this.dragging = false;
        this.pendingDrag = null;
        this.grabOffset = 0;
        this.state = {
            selectedShip: null,
            hover: null,
            pointer: null,
            busy: false,
            error: "",
        };
    }

    componentDidMount() {
        window.addEventListener("pointermove", this.movePointer);
        window.addEventListener("pointerup", this.releasePointer);
        window.addEventListener("pointercancel", this.cancelDrag);
        window.addEventListener("blur", this.cancelDrag);
        window.addEventListener("keydown", this.handleKey);
    }

    componentWillUnmount() {
        window.removeEventListener("pointermove", this.movePointer);
        window.removeEventListener("pointerup", this.releasePointer);
        window.removeEventListener("pointercancel", this.cancelDrag);
        window.removeEventListener("blur", this.cancelDrag);
        window.removeEventListener("keydown", this.handleKey);
    }

    cancelDrag = () => {
        this.dragging = false;
        this.pendingDrag = null;
        this.setState({ selectedShip: null, hover: null, pointer: null });
    };

    startDrag = (event, ship, offset) => {
        if (
            event.button !== 0 ||
            this.props.disabled ||
            this.state.busy ||
            this.props.game.players.you.ready
        ) return;
        event.preventDefault();
        this.pendingDrag = { ship, offset, x: event.clientX, y: event.clientY };
    };

    takeShip = (event, row, col) => {
        const id = this.props.board[row][col];
        if (!id) return;

        const ship = getShip(this.props.board, id);
        let offset = col - ship.col;
        if (ship.vertical) offset = row - ship.row;
        this.startDrag(event, ship, offset);
    };

    targetCell = (event, ship = this.state.selectedShip) => {
        const cell = pointerCell(event, this.boardRef.current);
        if (ship.vertical) cell.row -= this.grabOffset;
        else cell.col -= this.grabOffset;
        return cell;
    };

    movePointer = (event) => {
        if (!this.pendingDrag) return;
        const { ship, offset, x, y } = this.pendingDrag;
        if (!this.dragging && Math.hypot(event.clientX - x, event.clientY - y) < 5) return;

        this.dragging = true;
        this.grabOffset = offset;
        const selectedShip = this.state.selectedShip || ship;
        this.setState({
            selectedShip,
            hover: this.targetCell(event, selectedShip),
            pointer: { x: event.clientX, y: event.clientY },
            error: "",
        });
    };

    releasePointer = (event) => {
        if (!this.pendingDrag) return;
        if (this.dragging && this.state.selectedShip) {
            const cell = this.targetCell(event);
            this.placeSelectedShip(cell.row, cell.col);
        }
        this.cancelDrag();
    };

    placeSelectedShip = (row, col) => {
        const ship = this.state.selectedShip;
        if (!ship || this.props.disabled || this.state.busy || this.props.game.players.you.ready)
            return;

        if (!canPlaceShip(this.props.board, ship, row, col)) {
            this.setState({ error: "Ships must fit inside the board and cannot touch." });
            return;
        }

        const board = placeShip(this.props.board, ship, row, col);
        this.props.onBoardChange(board);
        this.setState({ selectedShip: null, hover: null, error: "" });
    };

    rotateShip = () => {
        const ship = this.state.selectedShip;
        if (!ship) return;
        this.setState({ selectedShip: { ...ship, vertical: !ship.vertical }, hover: null });
    };

    handleKey = (event) => {
        if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA") return;
        if (event.code === "KeyR") this.rotateShip();
        if (event.code === "Escape") this.cancelDrag();
    };

    changeReady = async () => {
        if (this.state.busy) return;
        this.setState({ busy: true, error: "", selectedShip: null });
        try {
            if (this.props.game.players.you.ready) {
                await cancelReady(this.props.game.id);
            } else {
                await readyPlayer(this.props.game.id, this.props.board);
            }
        } catch (error) {
            this.setState({ error: error.message });
        } finally {
            this.setState({ busy: false });
        }
    };

    render() {
        const { game, board, onBoardChange, onGoHome, onLeaveGame } = this.props;
        const { selectedShip, hover, pointer, busy, error } = this.state;
        const ready = game.players.you.ready;
        const disabled = this.props.disabled || busy || ready;
        const unplacedShips = SHIPS_CONFIG.filter(
            (ship) => !board.some((row) => row.includes(ship.id)),
        );
        let preview = null;
        if (selectedShip && hover) {
            preview = {
                cells: shipCells(hover.row, hover.col, selectedShip.size, selectedShip.vertical),
                valid: canPlaceShip(board, selectedShip, hover.row, hover.col),
            };
        }

        let message = "Place your ships. R rotates while dragging.";
        if (ready) message = "Fleet ready. Waiting for the other player.";

        return (
            <>
                <Header
                    onGoHome={onGoHome}
                    message={message}
                />
                <div className="game-controls">
                    <button
                        disabled={disabled}
                        onClick={() => onBoardChange(randomBoard())}
                    >
                        Random placement
                    </button>
                    <button
                        disabled={disabled}
                        onClick={() => onBoardChange(createBoard())}
                    >
                        Reset fleet
                    </button>
                    <button
                        disabled={busy || this.props.disabled}
                        onClick={onLeaveGame}
                    >
                        Leave lobby
                    </button>
                    <p>Hold and drag a ship. R rotates it while dragging. Escape cancels.</p>
                    <p>Opponent: {game.players.opponent.ready ? "Ready" : "Placing ships"}</p>
                    {error && <p role="alert">{error}</p>}
                </div>
                <div id="containerForField">
                    <Battlefield
                        title="Your fleet"
                        board={board}
                        boardRef={this.boardRef}
                        disabled={disabled}
                        preview={preview}
                        selectedShipId={selectedShip?.id}
                        onCellPointerDown={this.takeShip}
                    >
                        {unplacedShips.map((config) => (
                            <button
                                key={config.id}
                                className="dock-ship"
                                aria-label={`Place ${config.id}`}
                                disabled={disabled}
                                onPointerDown={(event) => {
                                    const rect = event.currentTarget.getBoundingClientRect();
                                    const offset = Math.min(
                                        config.size - 1,
                                        Math.floor(
                                            (event.clientX - rect.left) /
                                                (rect.width / config.size),
                                        ),
                                    );
                                    this.startDrag(event, { ...config, vertical: false }, offset);
                                }}
                            >
                                <BattleShip size={config.size} />
                            </button>
                        ))}
                        {unplacedShips.length === 0 && (
                            <button
                                className="readyToGoButton"
                                disabled={busy || this.props.disabled}
                                onClick={this.changeReady}
                            >
                                {ready ? "Cancel ready" : "Ready to go"}
                            </button>
                        )}
                    </Battlefield>
                </div>
                {selectedShip && pointer && (
                    <div
                        id="draggingShip"
                        style={{ left: pointer.x + 12, top: pointer.y + 12 }}
                    >
                        <BattleShip
                            size={selectedShip.size}
                            vertical={selectedShip.vertical}
                        />
                    </div>
                )}
            </>
        );
    }
}
