import React from "react";
import Header from "../header/Header.jsx";
import Battlefield from "../battlefield/Battlefield.jsx";
import BattleShip from "../battleship/BattleShip.jsx";
import EnemyShipsList from "./EnemyShipsList.jsx";
import { GADGETS } from "../../constants.js";
import {
    createBoard,
    boardFromShips,
    getShip,
    shipCells,
    canPlaceShip,
    pointerCell,
} from "../../board.js";
import { fireShot, activateGadget } from "../../gameApi.js";
import "./battleshipGame.css";

export default class BattleshipGame extends React.Component {
    constructor(props) {
        super(props);
        this.boardRef = React.createRef();
        this.dragging = false;
        this.grabOffset = 0;
        this.state = {
            gadget: null,
            selectedShip: null,
            hover: null,
            radarTarget: null,
            pointer: null,
            busy: false,
            error: "",
        };
    }

    componentDidMount() {
        window.addEventListener("pointermove", this.movePointer);
        window.addEventListener("pointerup", this.releasePointer);
        window.addEventListener("keydown", this.handleKey);
    }

    componentWillUnmount() {
        window.removeEventListener("pointermove", this.movePointer);
        window.removeEventListener("pointerup", this.releasePointer);
        window.removeEventListener("keydown", this.handleKey);
    }

    canPlay = () => {
        const game = this.props.game;
        return (
            game.phase === "battle" &&
            game.turnPlayerId === game.players.you.id &&
            !this.state.busy &&
            !this.props.disabled
        );
    };

    cancelGadget = () => {
        this.dragging = false;
        this.setState({
            gadget: null,
            selectedShip: null,
            hover: null,
            radarTarget: null,
            pointer: null,
        });
    };

    selectGadget = (gadget) => {
        this.cancelGadget();
        if (this.state.gadget !== gadget) this.setState({ gadget, error: "" });
    };

    shoot = async (row, col) => {
        if (!this.canPlay()) return;
        const alreadyShot = this.props.game.players.you.shots.some(
            (shot) => shot.row === row && shot.col === col,
        );
        if (alreadyShot) return;

        this.setState({ busy: true, error: "" });
        try {
            await fireShot(this.props.game.id, row, col);
        } catch (error) {
            this.setState({ error: error.message });
        } finally {
            this.setState({ busy: false });
        }
    };

    applyGadget = async (row, col) => {
        if (!this.canPlay()) return;
        const { gadget, selectedShip } = this.state;

        if (gadget === "relocate") {
            if (!selectedShip) return;
            const original = getShip(
                boardFromShips(this.props.game.players.you.ships),
                selectedShip.id,
            );
            if (
                row === original.row &&
                col === original.col &&
                original.vertical === selectedShip.vertical
            )
                return;
        }

        this.setState({ busy: true, error: "" });
        try {
            await activateGadget(
                this.props.game.id,
                gadget,
                row,
                col,
                selectedShip?.id,
                selectedShip?.vertical,
            );
            this.cancelGadget();
        } catch (error) {
            this.setState({ error: error.message });
        } finally {
            this.setState({ busy: false });
        }
    };

    clickEnemy = (row, col) => {
        if (this.state.gadget === "radar") this.applyGadget(row, col);
        else if (!this.state.gadget) this.shoot(row, col);
    };

    selectShip = (row, col) => {
        const you = this.props.game.players.you;
        const board = boardFromShips(you.ships);
        const shipId = board[row][col];
        if (!shipId) return null;

        const ship = you.ships.find((ship) => ship.id === shipId);
        if (ship.cells.some((cell) => cell.hit)) {
            this.setState({ error: "Choose an undamaged ship." });
            return null;
        }

        const selectedShip = getShip(board, shipId);
        this.setState({ selectedShip, hover: null, error: "" });
        return selectedShip;
    };

    clickOwnBoard = (row, col) => {
        if (!this.canPlay()) return;
        if (this.state.gadget === "mine") {
            this.applyGadget(row, col);
        } else if (this.state.gadget === "relocate") {
            if (this.state.selectedShip) this.applyGadget(row, col);
            else this.selectShip(row, col);
        }
    };

    takeShip = (event, row, col) => {
        if (event.button !== 0 || this.state.gadget !== "relocate" || !this.canPlay()) return;
        const ship = this.selectShip(row, col);
        if (!ship) return;

        event.preventDefault();
        this.dragging = true;
        this.grabOffset = col - ship.col;
        if (ship.vertical) this.grabOffset = row - ship.row;
        this.setState({ pointer: { x: event.clientX, y: event.clientY } });
    };

    targetCell = (event) => {
        const cell = pointerCell(event, this.boardRef.current);
        if (this.state.selectedShip.vertical) cell.row -= this.grabOffset;
        else cell.col -= this.grabOffset;
        return cell;
    };

    movePointer = (event) => {
        if (!this.dragging) return;
        this.setState({
            hover: this.targetCell(event),
            pointer: { x: event.clientX, y: event.clientY },
        });
    };

    releasePointer = (event) => {
        if (!this.dragging) return;
        const cell = this.targetCell(event);
        this.dragging = false;
        this.setState({ pointer: null });
        this.applyGadget(cell.row, cell.col);
    };

    rotateShip = () => {
        const ship = this.state.selectedShip;
        if (ship)
            this.setState({ selectedShip: { ...ship, vertical: !ship.vertical }, hover: null });
    };

    handleKey = (event) => {
        if (event.code === "KeyR") this.rotateShip();
        if (event.code === "Escape") this.cancelGadget();
    };

    render() {
        const { game, onGoHome, onLeaveGame } = this.props;
        const { gadget, selectedShip, hover, radarTarget, pointer, error } = this.state;
        const you = game.players.you;
        const opponent = game.players.opponent;
        const board = boardFromShips(you.ships);
        const finished = game.phase === "finished";
        const disabled = !this.canPlay();
        let turnStatus = "opponent_turn";
        if (game.turnPlayerId === you.id) turnStatus = "my_turn";
        if (finished) turnStatus = game.winnerPlayerId === you.id ? "won" : "lost";

        let instruction =
            "Each gadget can be used once on your turn. It does not replace your shot.";
        if (gadget === "radar")
            instruction = "Click the center of a 3 by 3 area to reveal exact ship cells.";
        if (gadget === "mine")
            instruction = "Click untried water on your own board to place the mine.";
        if (gadget === "relocate")
            instruction =
                "Select an undamaged ship and its new position, or drag it. R rotates it.";

        let preview = null;
        if (selectedShip && hover) {
            const blocked = opponent.shots.slice();
            if (you.mine) blocked.push(you.mine);
            preview = {
                cells: shipCells(hover.row, hover.col, selectedShip.size, selectedShip.vertical),
                valid: canPlaceShip(board, selectedShip, hover.row, hover.col, blocked),
            };
        }

        return (
            <>
                <Header
                    onGoHome={onGoHome}
                    turnStatus={turnStatus}
                />
                <div className="game-controls">
                    {finished ? (
                        <>
                            <h2>{game.winnerPlayerId === you.id ? "Victory" : "Defeat"}</h2>
                            <button
                                disabled={this.props.disabled}
                                onClick={onLeaveGame}
                            >
                                Back to menu
                            </button>
                        </>
                    ) : (
                        <>
                            <p>
                                {you.name} vs {opponent.name}
                            </p>
                            <button
                                disabled={this.props.disabled || this.state.busy}
                                onClick={onLeaveGame}
                            >
                                Surrender
                            </button>
                            <p className="gadget-hint">{instruction}</p>
                            {gadget && <button onClick={this.cancelGadget}>Cancel gadget</button>}
                            {selectedShip && <button onClick={this.rotateShip}>Rotate ship</button>}
                        </>
                    )}
                    {error && <p role="alert">{error}</p>}
                </div>
                <div className="battleContainer">
                    <Battlefield
                        title="Your fleet"
                        board={board}
                        shots={opponent.shots}
                        mine={you.mine}
                        preview={preview}
                        selectedShipId={selectedShip?.id}
                        boardRef={this.boardRef}
                        disabled={disabled}
                        onCellClick={this.clickOwnBoard}
                        onCellPointerDown={this.takeShip}
                        onCellHover={(row, col) => {
                            if (!this.dragging)
                                this.setState({ hover: row === null ? null : { row, col } });
                        }}
                    >
                        {GADGETS.map((item) => (
                            <button
                                key={item.id}
                                className="gadgetButton"
                                aria-label={item.name}
                                aria-pressed={gadget === item.id}
                                title={item.desc}
                                disabled={disabled || you.usedGadgets.includes(item.id)}
                                onClick={() => this.selectGadget(item.id)}
                            >
                                {item.icon}
                            </button>
                        ))}
                    </Battlefield>
                    <Battlefield
                        title={opponent.name}
                        board={createBoard()}
                        shots={you.shots}
                        radar={you.radar}
                        radarTarget={gadget === "radar" ? radarTarget : null}
                        disabled={disabled}
                        onCellClick={this.clickEnemy}
                        onCellHover={(row, col) =>
                            this.setState({ radarTarget: row === null ? null : { row, col } })
                        }
                    >
                        <EnemyShipsList shots={you.shots} />
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
