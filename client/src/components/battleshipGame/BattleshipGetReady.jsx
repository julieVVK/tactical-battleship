/**
 * @file battleshipGetReady.jsx
 * @description Component for the fleet setup phase. Manages ship placement,
 * drag-and-drop mechanics, rotation, collision detection, and prepares
 * the player's board data before the battle starts.
 * @author xhaziyh00, xslobok00
 */

// Edited by Vladyslav Doroshenko
//     - Added foreign languages support
//       Changed lines: 13, 19, 31, 313, 322, 325, 351

import { LanguageContext } from '../../i18n/LanguageContext.js';
import React from "react";
import Header from "../header/Header.jsx";
import Battlefield from "../battlefield/Battlefield.jsx";
<<<<<<< HEAD
import Battleship from "../battleship/BattleShip";
import { SHIPS_CONFIG } from "../../constants.js";
import "../battlefield/battlefield.css";
=======
import BattleShip from "../battleship/BattleShip.jsx";
import {SHIPS_CONFIG} from "../../constants.js";
import "./getReady.css";
>>>>>>> 9b7a06ffac08f2ad7b3f9b34cfe82279ff0c6c2c

/**
 * GetReady class component.
 *
 * @author xhaziyh00, xslobok00
 * @property {Object} props - Component input properties.
 * @property {Function} props.onGoHome - Callback function to return to the main menu screen.
 * @property {Function} props.onStartBattle - Callback triggered when the fleet is fully placed.
 * @property {Object} state - Component internal state.
 * @property {Array<Object>} state.myShips - Array of player ships initialized with placement and orientation flags.
 */
class GetReady extends React.Component {
<<<<<<< HEAD
  // author:xhaziyh00 - Initialize fleet state by decorating SHIPS_CONFIG templates with orientation and placement flags
  constructor(props) {
    super(props);
=======
    static contextType = LanguageContext;

>>>>>>> 9b7a06ffac08f2ad7b3f9b34cfe82279ff0c6c2c
    // author:xhaziyh00 - Initialize fleet state by decorating SHIPS_CONFIG templates with orientation and placement flags
    this.boardRef = React.createRef();

    const emptyBoard = Array(10)
      .fill(null)
      .map(() =>
        Array(10)
          .fill(null)
          .map(() => ({
            hasShip: false,
            shipId: null,
            hit: false,
            miss: false,
          })),
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
      mousePos: { x: 0, y: 0 },
    };
  }

  componentDidMount() {
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("mouseup", this.handleGlobalMouseUp);
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("mousemove", this.handleMouseMove);
    window.removeEventListener("mouseup", this.handleGlobalMouseUp);
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
            if (board[checkX][checkY]?.hasShip /* || board[checkY][checkX]?.hasShip*/) {
              return false;
            }
          }
        }
      }
    }
    return true; //xslobok00: ok. you can plase it
  };

  // xslobok00: take a ship
  handleShipDragStart = (e, ship) => {
    const updatedShips = this.state.myShips.map((s) => (s.id === ship.id ? { ...s, isPlaced: true } : s));
    this.setState({
      draggingShip: ship,
      myShips: updatedShips,
      mousePos: { x: e.clientX, y: e.clientY },
    });
  };

  //xslobok00: plase a ship

  handleCellDragOver = (e, rowIndex, colIndex) => {
    e.preventDefault();
    const { currentHoveredCell, draggingShip } = this.state;

    let targetX = rowIndex;
    let targetY = colIndex;

    if (draggingShip && draggingShip.size > 1) {
      if (draggingShip.isVertical) {
        targetX = Math.max(0, rowIndex);
      } else {
        targetY = Math.max(0, colIndex);
      }
    }

    if (!currentHoveredCell || currentHoveredCell.x !== targetX || currentHoveredCell.y !== targetY) {
      this.setState({
        currentHoveredCell: { x: targetX, y: targetY },
      });
    }
  };

  handleCellDrop = (e, rowIndex, colIndex) => {
    e.preventDefault();
    !this.handleGlobalMouseUp();
  };

  toggleShipOrientation = (shipId) => {
    this.setState((prevState) => ({
      myShips: prevState.myShips.map((s) => (s.id === shipId ? { ...s, isVertical: !s.isVertical } : s)),
    }));
  };

  handleMouseMove = (e) => {
    if (this.state.draggingShip) {
      this.setState({
        mousePos: { x: e.clientX, y: e.clientY },
      });
    }
  };

  handleGlobalMouseUp = () => {
    const { draggingShip, currentHoveredCell, boardData } = this.state;
    if (!draggingShip) return;

    if (!currentHoveredCell) {
      this.returnShipToDock(draggingShip.id);
      return;
    }

    //const { x: rowIndex, y: colIndex } = currentHoveredCell;
    const rowIndex = currentHoveredCell.x;
    const colIndex = currentHoveredCell.y;

    if (!this.canPlaceShip(rowIndex, colIndex, draggingShip.size, draggingShip.isVertical, boardData)) {
      this.returnShipToDock(draggingShip.id);
      return;
    }

    const newBoard = boardData.map((row) => row.map((cell) => ({ ...cell })));
    for (let i = 0; i < draggingShip.size; i++) {
      let currentX = draggingShip.isVertical ? rowIndex + i : rowIndex;
      let currentY = draggingShip.isVertical ? colIndex : colIndex + i;

      if (newBoard[currentX] && newBoard[currentX][currentY]) {
        newBoard[currentX][currentY].hasShip = true;
        newBoard[currentX][currentY].shipId = String(draggingShip.id);
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
    const restoredShips = this.state.myShips.map((s) => (s.id === shipId ? { ...s, isPlaced: false } : s));
    this.setState({
      myShips: restoredShips,
      draggingShip: null,
      currentHoveredCell: null,
    });
  };

  //xslobok00: rotate on r
  handleKeyDown = (e) => {
    if (e.key === "r" || e.key === "R" || e.key === "к" || e.key === "К") {
      const { draggingShip, myShips } = this.state;

      // xslobok00: works with mouse + r
      if (draggingShip) {
        const nextOrientation = !draggingShip.isVertical;

        //xslobok00: change orientation
        const updatedDraggingShip = {
          ...draggingShip,
          isVertical: nextOrientation,
        };
      }
    }
  };

  /**
   * xslobok00: placing check
   */
  canPlaceShip = (startX, startY, size, isVertical, board) => {
    if (!board || !Array.isArray(board)) return false;

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
            const row = board[checkX] || [];
            const cell = row[checkY];

            if (cell && cell.hasShip) {
              if (this.state.draggingShip && cell.shipId === this.state.draggingShip.id) {
                continue;
              }
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
    const updatedShips = this.state.myShips.map((s) => (s.id === ship.id ? { ...s, isPlaced: true } : s));
    this.setState({
      draggingShip: ship,
      myShips: updatedShips,
      mousePos: { x: e.clientX, y: e.clientY },
    });
  };

  //xslobok00: place a ship
  handleCellDragOver = (e, rowIndex, colIndex) => {
    if (e === null) {
      this.setState({ currentHoveredCell: null });
      return;
    }
    e.preventDefault();
    const { currentHoveredCell } = this.state;
    let targetX = rowIndex;
    let targetY = colIndex;

    if (!currentHoveredCell || currentHoveredCell.x !== targetX || currentHoveredCell.y !== targetY) {
      this.setState({
        currentHoveredCell: { x: targetX, y: targetY },
      });
    }
  };

  handleCellDrop = (e, rowIndex, colIndex) => {
    e.preventDefault();
    const { draggingShip } = this.state;
    let targetX = rowIndex;
    let targetY = colIndex;

    if (draggingShip) {
      if (draggingShip.isVertical) {
        targetX = Math.min(rowIndex, 10 - draggingShip.size);
        targetX = Math.max(0, targetX);
      } else {
        targetY = Math.min(colIndex, 10 - draggingShip.size);
        targetY = Math.max(0, targetY);
      }
    }

    this.setState(
      {
        currentHoveredCell: { x: targetX, y: targetY },
      },
      () => {
        this.handleGlobalMouseUp();
      },
    );
  };

  toggleShipOrientation = (shipId) => {
    this.setState((prevState) => ({
      myShips: prevState.myShips.map((s) => (s.id === shipId ? { ...s, isVertical: !s.isVertical } : s)),
    }));
  };

  handleMouseMove = (e) => {
    if (!this.state.draggingShip) return;

    this.setState({
      mousePos: { x: e.clientX, y: e.clientY },
    });

    if (this.boardRef.current) {
      const rect = this.boardRef.current.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const relativeY = e.clientY - rect.top;
      const cellSize = rect.width / 10;

      const colIndex = Math.floor(relativeX / cellSize);
      const rowIndex = Math.floor(relativeY / cellSize);

      const size = this.state.draggingShip.size;
      const isVertical = this.state.draggingShip.isVertical;

      const minRow = isVertical ? -(size - 1) : 0;
      const maxRow = 9;
      const minCol = isVertical ? 0 : -(size - 1);
      const maxCol = 9;

      if (rowIndex >= minRow && rowIndex <= maxRow && colIndex >= minCol && colIndex <= maxCol) {
        if (!this.state.currentHoveredCell || this.state.currentHoveredCell.x !== rowIndex || this.state.currentHoveredCell.y !== colIndex) {
          this.setState({
            currentHoveredCell: { x: rowIndex, y: colIndex },
          });
        }
      } else {
        if (this.state.currentHoveredCell !== null) {
          this.setState({ currentHoveredCell: null });
        }
      }
    }
  };

  handleGlobalMouseUp = () => {
    const { draggingShip, currentHoveredCell, boardData, myShips } = this.state;
    if (!draggingShip) return;

    if (!currentHoveredCell) {
      this.returnShipToDock(draggingShip.id);
      return;
    }

    //const { x: rowIndex, y: colIndex } = currentHoveredCell;
    const rowIndex = currentHoveredCell.x;
    const colIndex = currentHoveredCell.y;

    if (!this.canPlaceShip(rowIndex, colIndex, draggingShip.size, draggingShip.isVertical, boardData)) {
      this.returnShipToDock(draggingShip.id);
      return;
    }

    const newBoard = boardData.map((row) => row.map((cell) => ({ ...cell })));
    for (let i = 0; i < draggingShip.size; i++) {
      let currentX = draggingShip.isVertical ? rowIndex + i : rowIndex;
      let currentY = draggingShip.isVertical ? colIndex : colIndex + i;

      if (newBoard[currentX] && newBoard[currentX][currentY]) {
        newBoard[currentX][currentY].hasShip = true;
        newBoard[currentX][currentY].shipId = draggingShip.id;
      }
    }
    // Orientation renew stateе
    const updatedMyShips = myShips.map((s) => (s.id === draggingShip.id ? { ...s, isPlaced: true } : s));

    this.setState({
      boardData: newBoard,
      draggingShip: null,
      currentHoveredCell: null,
      myShips: updatedMyShips,
    });
  };
  //xslobok00: returns ship to dock
  returnShipToDock = (shipId) => {
    const restoredShips = this.state.myShips.map((s) => (s.id === shipId ? { ...s, isPlaced: false } : s));
    this.setState({
      myShips: restoredShips,
      draggingShip: null,
      currentHoveredCell: null,
    });
  };

  // xslobok00: rotate on r
  // author:xhaziyh00 - modified to use e.code for any keyboard layout and added random placement
  handleKeyDown = (e) => {
    if (e.code === "KeyR") {
      const { draggingShip, myShips } = this.state;

      // xslobok00: works with mouse + r
      if (draggingShip) {
        const nextOrientation = !draggingShip.isVertical;

        // xslobok00: change orientation
        const updatedDraggingShip = {
          ...draggingShip,
          isVertical: nextOrientation,
        };

        // Orientation renew state
        const updatedMyShips = myShips.map((s) => (s.id === draggingShip.id ? { ...s, isVertical: nextOrientation } : s));

        this.setState({
          draggingShip: updatedDraggingShip,
          myShips: updatedMyShips,
        });
      } else {
        // author:xhaziyh00 - Trigger random placement if board is idle
        this.randomizeShips();
      }
    }
  };
  // author:xhaziyh00 - Randomly place all ships
  randomizeShips = () => {
    const emptyBoard = Array(10)
      .fill(null)
      .map(() =>
        Array(10)
          .fill(null)
          .map(() => ({
            hasShip: false,
            shipId: null,
            hit: false,
            miss: false,
          })),
      );

    let tempBoard = emptyBoard;
    let updatedShips = [...this.state.myShips];

    updatedShips = updatedShips.map((ship) => {
      let placed = false;
      let isVertical = false;
      let startX = 0;
      let startY = 0;

      while (!placed) {
        isVertical = Math.random() < 0.5;
        startX = Math.floor(Math.random() * (isVertical ? 10 - ship.size + 1 : 10));
        startY = Math.floor(Math.random() * (isVertical ? 10 : 10 - ship.size + 1));

        if (this.canPlaceShip(startX, startY, ship.size, isVertical, tempBoard)) {
          for (let i = 0; i < ship.size; i++) {
            let curX = isVertical ? startX + i : startX;
            let curY = isVertical ? startY : startY + i;
            tempBoard[curX][curY].hasShip = true;
            tempBoard[curX][curY].shipId = String(ship.id);
          }
          placed = true;
        }
      }
      return { ...ship, isVertical, isPlaced: true };
    });

    this.setState({
      boardData: tempBoard,
      myShips: updatedShips,
      currentHoveredCell: null,
    });
  };

  // xslobok00: replase a ship
  handlePlacedShipDragStart = (e, rowIndex, colIndex) => {
    const { boardData, myShips } = this.state;

    const targetShipId = boardData[rowIndex]?.[colIndex]?.shipId;

    if (targetShipId) {
      const originalShip = myShips.find((s) => String(s.id) === String(targetShipId));
      if (!originalShip) return;

      // xslobok00: take it from field

      const newBoard = boardData.map((row) =>
        row.map((cell) => {
          if (String(cell.shipId) === String(targetShipId)) {
            return {
              hasShip: false,
              shipId: null,
              hit: false,
              miss: false,
            };
          }

          return { ...cell };
        }),
      );

      // xslobok00: not in docs
      const updatedShips = myShips.map((s) => (String(s.id) === String(targetShipId) ? { ...s, isPlaced: true } : s));

      // xslobok00: take a whole ship in cursor
      this.setState({
        boardData: newBoard,
        myShips: updatedShips,
        draggingShip: { ...originalShip, isPlaced: true },
        mousePos: { x: e.clientX, y: e.clientY },
      });
    }
  };

  handleReadyToGo = (boardData, ships) => {
    const payload = {
      gameId: this.props.gameId,
      playerId: this.props.userId,
      board: boardData.map((row) => row.map((cell) => (cell.hasShip ? cell.shipId : null))),
    };

    console.log("send board:", payload);
    this.props.socket.emit("readyPlayer", payload);
    if (this.props.onStartBattle) {
      this.props.onStartBattle(boardData, ships, payload.board);
    }
  };

  /**
   * Renders the game arena: top navigation header and side-by-side battlefields.
   *
   * @author xhaziyh00
   * @returns {JSX.Element} Full getReady screen layout.
   */
  render() {
    const { draggingShip, mousePos } = this.state;

    return (
      <>
        {/* author:xhaziyh00 - Top navigation bar with return-to-home callback forwarding */}
        <Header onGoHome={this.props.onGoHome} />

        {/* author:xhaziyh00 - Side-by-side arena container: player's fleet on the left, opponent's grid on the right */}
        <div id="containerForField">
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
            onStartBattle={this.handleReadyToGo}
            containerRef={this.boardRef}
            draggingShip={this.state.draggingShip}
            currentHoveredCell={this.state.currentHoveredCell}
            canPlaceShip={this.canPlaceShip}
          />

          {/* xslobok00: layer for replase and rotate in process */}
          {draggingShip && (
            <div
              style={{
                position: "fixed",
                pointerEvents: "none",
                left: `${mousePos.x - 15}px`,
                top: `${mousePos.y - 15}px`,
                zIndex: 9999,
              }}>
              <Battleship size={draggingShip.size} isVertical={draggingShip.isVertical} isDraggable={false} />
            </div>
          )}
        </div>
      </>
    );
  }
}
export default GetReady;
