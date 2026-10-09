/**
 * @file battleshipGame.jsx
 * @description Main gameplay controller component. Manages the dual-board arena layout,
 * initializes player fleet state from SHIPS_CONFIG, and coordinates communication
 * between the navigation Header and both Battlefield grids.
 * @author xhaziyh00
 */

import React from "react";
import Header from "../header/header.jsx";
import Battlefield from "../battlefield/battlefield.jsx";
import Battleship from "../battleship/battleShip";
import {SHIPS_CONFIG} from "../../constants.js";

/**
 * BatlleshipGame class component.
 *
 * @author xhaziyh00
 * @property {Object} props - Component input properties.
 * @property {Function} props.onGoHome - Callback function to return to the main menu screen.
 * @property {Object} state - Component internal state.
 * @property {Array<Object>} state.myShips - Array of player ships initialized with placement and orientation flags.
 */
class GetReady extends React.Component {
    // author:xhaziyh00 - Initialize fleet state by decorating SHIPS_CONFIG templates with orientation and placement flags
    constructor(props) {
        super(props);
        // author:xhaziyh00 - Initialize fleet state by decorating SHIPS_CONFIG templates with orientation and placement flags

        const emptyBoard = Array(10)
            .fill(null)
            .map(() =>
                Array(10)
                    .fill(null)
                    .map(() => ({hasShip: false, hit: false, miss: false})),
            );

        this.state = {
            myShips: SHIPS_CONFIG.map((ship) => ({
                ...ship,
                isVertical: false,
                isPlaced: false,
            })),
            boardData: emptyBoard,
            draggingShip: null,
            currentHoveredCell: null,
            mousePos: {x: 0, y: 0},
        };
    }

    componentDidMount() {
        window.addEventListener("keydown", this.handleKeyDown);
        window.addEventListener("mousemove", this.handleMouseMove);
        window.addEventListener("mouseup", this.handleGlobalMouseUp); // xslobok00: ловим отпускание мыши по всему экрану
    }

    componentWillUnmount() {
        window.removeEventListener("keydown", this.handleKeyDown);
        window.removeEventListener("mousemove", this.handleMouseMove);
        window.removeEventListener("mouseup", this.handleGlobalMouseUp); // xslobok00: ловим отпускание мыши по всему экрану
    }

    /**
     * xslobok00: placing check
     */
    canPlaceShip = (startX, startY, size, isVertical, board) => {
        for (let i = 0; i < size; i++) {
            let currentX = isVertical ? startX + i : startX;
            let currentY = isVertical ? startY : startY + i;

            //xslobok00: is it out of board?
            if (currentX < 0 || currentX >= 10 || currentY < 0 || currentY >= 10) {
                return false;
            }

            //xslobok00: is neighbour places free?
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    let checkX = currentX + dx;
                    let checkY = currentY + dy;

                    //xslobok00: is coord in board?
                    if (checkX >= 0 && checkX < 10 && checkY >= 0 && checkY < 10) {
                        if (
                            board[checkX][checkY]
                                ?.hasShip /* || board[checkY][checkX]?.hasShip*/
                        ) {
                            return false;
                        }
                    }
                }
            }
        }
        return true; //xslobok00: ok. you can place it
    };

    // xslobok00: take a ship
    handleShipDragStart = (e, ship) => {
        const updatedShips = this.state.myShips.map((s) =>
            s.id === ship.id ? {...s, isPlaced: true} : s,
        );
        this.setState({
            draggingShip: ship,
            myShips: updatedShips,
            mousePos: {x: e.clientX, y: e.clientY},
        });
    };

    //xslobok00: place a ship

    handleCellDragOver = (e, rowIndex, colIndex) => {
        e.preventDefault();
        const {currentHoveredCell, draggingShip} = this.state;

        let targetX = rowIndex;
        let targetY = colIndex;

        if (draggingShip && draggingShip.size > 1) {
            if (draggingShip.isVertical) {
                targetX = Math.max(0, rowIndex);
            } else {
                targetY = Math.max(0, colIndex);
            }
        }

        if (
            !currentHoveredCell ||
            currentHoveredCell.x !== targetX ||
            currentHoveredCell.y !== targetY
        ) {
            this.setState({
                currentHoveredCell: {x: targetX, y: targetY},
            });
        }
    };

    handleCellDrop = (e, rowIndex, colIndex) => {
        e.preventDefault();
        !this.handleGlobalMouseUp();
    };

    toggleShipOrientation = (shipId) => {
        this.setState((prevState) => ({
            myShips: prevState.myShips.map((s) =>
                s.id === shipId ? {...s, isVertical: !s.isVertical} : s,
            ),
        }));
    };

    handleMouseMove = (e) => {
        if (this.state.draggingShip) {
            this.setState({
                mousePos: {x: e.clientX, y: e.clientY},
            });
        }
    };

    handleGlobalMouseUp = () => {
        const {draggingShip, currentHoveredCell, boardData} = this.state;
        if (!draggingShip) return;

        if (!currentHoveredCell) {
            console.log(" Мышка отпущена МИМО поля");
            this.returnShipToDock(draggingShip.id);
            return;
        }

        //const { x: rowIndex, y: colIndex } = currentHoveredCell;
        const rowIndex = currentHoveredCell.x;
        const colIndex = currentHoveredCell.y;

        console.log(
            ` Пытаемся поставить корабль ${draggingShip.id} в координаты: Строка ${rowIndex}, Колонка ${colIndex}`,
        );

        if (
            !this.canPlaceShip(
                rowIndex,
                colIndex,
                draggingShip.size,
                draggingShip.isVertical,
                boardData,
            )
        ) {
            console.log(
                " Проверка canPlaceShip НЕ ПРОШЛА! Место занято или вылезло за край.",
            );
            this.returnShipToDock(draggingShip.id);
            return;
        }

        // Если всё ок — красим сетку (ставим корабль)
        const newBoard = boardData.map((row) => row.map((cell) => ({...cell})));
        for (let i = 0; i < draggingShip.size; i++) {
            let currentX = draggingShip.isVertical ? rowIndex + i : rowIndex;
            let currentY = draggingShip.isVertical ? colIndex : colIndex + i;

            // xslobok00: Красим ячейки в сетке Гоши (учитываем его структуру)
            if (newBoard[currentX] && newBoard[currentX][currentY]) {
                newBoard[currentX][currentY].hasShip = true;
                newBoard[currentX][currentY].shipId = draggingShip.id;
            }
        }

        this.setState({
            boardData: newBoard,
            draggingShip: null,
            currentHoveredCell: null,
        });
    };

    //xslobok00: returns ship to dock
    returnShipToDock = (shipId) => {
        const restoredShips = this.state.myShips.map((s) =>
            s.id === shipId ? {...s, isPlaced: false} : s,
        );
        this.setState({
            myShips: restoredShips,
            draggingShip: null,
            currentHoveredCell: null,
        });
    };

    //xslobok00: rotate on r
    handleKeyDown = (e) => {
        if (e.key === "r" || e.key === "R" || e.key === "к" || e.key === "К") {
            const {draggingShip, myShips} = this.state;

            // xslobok00: works with mouse + r
            if (draggingShip) {
                const nextOrientation = !draggingShip.isVertical;

                //xslobok00: change orientation
                const updatedDraggingShip = {
                    ...draggingShip,
                    isVertical: nextOrientation,
                };

                // Orientation renew state
                const updatedMyShips = myShips.map((s) =>
                    s.id === draggingShip.id ? {...s, isVertical: nextOrientation} : s,
                );

                this.setState({
                    draggingShip: updatedDraggingShip,
                    myShips: updatedMyShips,
                });

                console.log("ship turned");
            }
        }
    };

    // xslobok00: replase a ship
    handlePlacedShipDragStart = (e, rowIndex, colIndex) => {
        const {boardData, myShips} = this.state;

        const cellDirect = boardData[rowIndex]?.[colIndex];
        const cellInverted = boardData[colIndex]?.[rowIndex];
        const targetShipId = cellDirect?.shipId || cellInverted?.shipId;

        if (targetShipId) {
            const originalShip = myShips.find((s) => s.id === targetShipId);
            if (!originalShip) return;

            // xslobok00: take it from field

            const newBoard = boardData.map((row) =>
                row.map((cell) => {
                    if (cell.shipId === targetShipId || cell.shipId === originalShip.id) {
                        return {
                            hasShip: false,
                            shipId: null,
                            hit: false,
                            miss: false,
                        };
                    }

                    return {...cell};
                }),
            );

            // xslobok00: not in docs
            const updatedShips = myShips.map((s) =>
                s.id === targetShipId ? {...s, isPlaced: true} : s,
            );

            // xslobok00: take a whole ship in cursor
            this.setState({
                boardData: newBoard,
                myShips: updatedShips,
                draggingShip: {...originalShip, isPlaced: true},
                mousePos: {x: e.clientX, y: e.clientY},
            });
        }
    };

    /**
     * Renders the game arena: top navigation header and side-by-side battlefields.
     *
     * @author xhaziyh00
     * @returns {JSX.Element} Full match screen layout.
     */
    render() {
        const {draggingShip, mousePos} = this.state;

        return (
            <>
                {/* author:xhaziyh00 - Top navigation bar with return-to-home callback forwarding */}
                <Header onGoHome={this.props.onGoHome}/>

                {/* author:xhaziyh00 - Side-by-side arena container: player's fleet on the left, opponent's grid on the right */}
                <div style={{display: "flex", justifyContent: "space-around"}}>
                    {/* Player's board displaying own ship positions and reserve setup dock */}
                    <Battlefield
                        title="Your fleet"
                        isOpponent={false}
                        isGetReadyScrn={true}
                        ships={this.state.myShips}
                        boardData={this.state.boardData}
                        onShipDragStart={this.handleShipDragStart}
                        onCellDragOver={this.handleCellDragOver}
                        onCellDrop={this.handleCellDrop}
                        onShipClick={(ship) => this.toggleShipOrientation(ship.id)}
                        onPlacedShipDragStart={this.handlePlacedShipDragStart}
                    />
                    <button
                        onClick={() => {
                            console.log("BOARD BEFORE SENDING TO APP:", this.state.boardData);
                            this.props.onStartBattle(
                                this.state.boardData,
                                this.state.myShips,
                            );
                        }}
                        style={{
                            padding: "16px 32px",
                            fontSize: "18px",
                            fontWeight: "600",
                            cursor: "pointer",
                        }}
                    >
                        gogogo
                    </button>
                    {/* xslobok00: layer for replase and rotate in process */}
                    {draggingShip && (
                        <div
                            style={{
                                position: "fixed",
                                pointerEvents: "none",
                                left: `${mousePos.x - 15}px`,
                                top: `${mousePos.y - 15}px`,
                                zIndex: 9999,
                            }}
                        >
                            <Battleship
                                size={draggingShip.size}
                                isVertical={draggingShip.isVertical}
                                isDraggable={false}
                            />
                        </div>
                    )}
                </div>
            </>
        );
    }
}

export default GetReady;
