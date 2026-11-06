/**
 * @file BattleshipGetReady.jsx
 * @description Fleet setup screen: drag-and-drop placement, rotation and random placement of ships.
 * Coordinates: `x` = ROW, `y` = COLUMN.
 *
 * @author xslobok00, xhaziyh00
 */

// Edited by Vladyslav Doroshenko
//     - Added foreign languages support

import { LanguageContext } from "../../i18n/LanguageContext.js";
import React from "react";
import Header from "../header/Header.jsx";
import Battlefield from "../battlefield/Battlefield.jsx";
import Battleship from "../battleship/BattleShip.jsx";
import { SHIPS_CONFIG, BOARD_SIZE } from "../../constants.js";
import "../battlefield/battlefield.css";

const DRAG_PREVIEW_OFFSET = 15;

/**
 * Creates an empty board (no ships, no shots).
 * @author xhaziyh00
 */
const createEmptyBoard = () =>
  Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => ({
      hasShip: false,
      shipId: null,
      hit: false,
      miss: false,
    })),
  );

/**
 * Returns true if the cell (row x, column y) is inside the board.
 * @author xhaziyh00
 */
const isInBounds = (x, y) => x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE;

/**
 * Fleet setup screen component.
 * @author xslobok00, xhaziyh00
 */
class GetReady extends React.Component {
  static contextType = LanguageContext;

  /**
   * Initializes the fleet from SHIPS_CONFIG and an empty board.
   * @author xhaziyh00
   */
  constructor(props) {
    super(props);

    this.boardRef = React.createRef();

    this.state = {
      myShips: SHIPS_CONFIG.map((ship) => ({ ...ship, isVertical: false, isPlaced: false })),
      boardData: createEmptyBoard(),
      draggingShip: null,
      dragOffset: { x: DRAG_PREVIEW_OFFSET, y: DRAG_PREVIEW_OFFSET },
      currentHoveredCell: null,
      mousePos: { x: 0, y: 0 },
    };
  }

  /**
   * Registers drag and keyboard listeners on window (dragging works outside the board too).
   * @author xslobok00
   */
  componentDidMount() {
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("mouseup", this.handleGlobalMouseUp);
  }

  /**
   * Removes window listeners.
   * @author xslobok00
   */
  componentWillUnmount() {
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("mousemove", this.handleMouseMove);
    window.removeEventListener("mouseup", this.handleGlobalMouseUp);
  }

  /**
   * Checks if a ship fits on the board and does not touch other ships (also diagonally).
   * Cells of the currently dragged ship are ignored.
   * @author xslobok00
   */
  canPlaceShip = (startX, startY, size, isVertical, board) => {
    if (!Array.isArray(board)) return false;

    const { draggingShip } = this.state;

    for (let i = 0; i < size; i++) {
      const currentX = isVertical ? startX + i : startX;
      const currentY = isVertical ? startY : startY + i;

      // Ship cell is out of the board
      if (!isInBounds(currentX, currentY)) return false;

      // Any of 8 neighbours belongs to another ship
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const checkX = currentX + dx;
          const checkY = currentY + dy;
          if (!isInBounds(checkX, checkY)) continue;

          const cell = board[checkX]?.[checkY];
          const isOtherShip = cell?.hasShip && !(draggingShip && cell.shipId === draggingShip.id);
          if (isOtherShip) return false;
        }
      }
    }

    return true;
  };

  /**
   * Takes a ship from the dock (it is hidden from the dock while dragging).
   * @author xslobok00
   */
  handleShipDragStart = (e, ship) => {
    const updatedShips = this.state.myShips.map((s) => (s.id === ship.id ? { ...s, isPlaced: true } : s));
    const rect = e.currentTarget.getBoundingClientRect();
    const dragOffset = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const cellSize = (ship.isVertical ? rect.height : rect.width) / ship.size;
    const grabIndex = Math.min(ship.size - 1, Math.floor((ship.isVertical ? dragOffset.y : dragOffset.x) / cellSize));

    this.setState({
      draggingShip: { ...ship, grabIndex },
      dragOffset,
      currentHoveredCell: null,
      myShips: updatedShips,
      mousePos: { x: e.clientX, y: e.clientY },
    });
  };

  /**
   * Remembers the hovered cell. Called with e === null when the cursor leaves the grid.
   * @author xslobok00
   */
  handleCellDragOver = (e, rowIndex, colIndex) => {
    // Cursor left the grid
    if (e === null) {
      this.setState({ currentHoveredCell: null });
      return;
    }
    e.preventDefault();

    const { currentHoveredCell } = this.state;
    const isSameCell = currentHoveredCell?.x === rowIndex && currentHoveredCell?.y === colIndex;
    if (!isSameCell) {
      this.setState({ currentHoveredCell: { x: rowIndex, y: colIndex } });
    }
  };

  /**
   * Moves the floating ship with the cursor and converts cursor position into a grid cell.
   * @author xslobok00
   */
  handleMouseMove = (e) => {
    const { draggingShip, currentHoveredCell } = this.state;
    if (!draggingShip) return;

    this.setState({ mousePos: { x: e.clientX, y: e.clientY } });

    if (!this.boardRef.current) return;

    const rect = this.boardRef.current.getBoundingClientRect();
    const cellSize = rect.width / BOARD_SIZE;
    const colIndex = Math.floor((e.clientX - rect.left) / cellSize);
    const rowIndex = Math.floor((e.clientY - rect.top) / cellSize);

    // Ship start may be above / left of the board, so the red "does not fit" preview is shown
    const { size, isVertical } = draggingShip;
    const minRow = isVertical ? -(size - 1) : 0;
    const minCol = isVertical ? 0 : -(size - 1);
    const lastIndex = BOARD_SIZE - 1;

    const isOverBoard = rowIndex >= minRow && rowIndex <= lastIndex && colIndex >= minCol && colIndex <= lastIndex;

    // Update state only when the hovered cell really changed
    if (isOverBoard) {
      const isSameCell = currentHoveredCell?.x === rowIndex && currentHoveredCell?.y === colIndex;
      if (!isSameCell) {
        this.setState({ currentHoveredCell: { x: rowIndex, y: colIndex } });
      }
    } else if (currentHoveredCell !== null) {
      this.setState({ currentHoveredCell: null });
    }
  };

  /**
   * Mouse released: places the dragged ship, or returns it to the dock if the place is wrong.
   * @author xslobok00
   */
  handleGlobalMouseUp = () => {
    const { draggingShip, currentHoveredCell, boardData, myShips } = this.state;
    if (!draggingShip) return;

    // Released outside the board
    if (!currentHoveredCell) {
      this.returnShipToDock(draggingShip.id);
      return;
    }

    const { isVertical, grabIndex = 0 } = draggingShip;
    const rowIndex = currentHoveredCell.x - (isVertical ? grabIndex : 0);
    const colIndex = currentHoveredCell.y - (isVertical ? 0 : grabIndex);

    // Released on a wrong place
    if (!this.canPlaceShip(rowIndex, colIndex, draggingShip.size, draggingShip.isVertical, boardData)) {
      this.returnShipToDock(draggingShip.id);
      return;
    }

    const newBoard = boardData.map((row) => row.map((cell) => ({ ...cell })));
    for (let i = 0; i < draggingShip.size; i++) {
      const currentX = draggingShip.isVertical ? rowIndex + i : rowIndex;
      const currentY = draggingShip.isVertical ? colIndex : colIndex + i;
      newBoard[currentX][currentY].hasShip = true;
      newBoard[currentX][currentY].shipId = draggingShip.id;
    }

    const updatedMyShips = myShips.map((s) => (s.id === draggingShip.id ? { ...s, isPlaced: true } : s));

    this.setState({
      boardData: newBoard,
      draggingShip: null,
      currentHoveredCell: null,
      myShips: updatedMyShips,
    });
  };

  /**
   * Returns the ship to the dock and ends the drag.
   * @author xslobok00
   */
  returnShipToDock = (shipId) => {
    const restoredShips = this.state.myShips.map((s) => (s.id === shipId ? { ...s, isPlaced: false } : s));

    this.setState({
      myShips: restoredShips,
      draggingShip: null,
      currentHoveredCell: null,
    });
  };

  /**
   * R key: rotates the dragged ship, or places the whole fleet randomly if nothing is dragged.
   * @author xslobok00, xhaziyh00
   */
  handleKeyDown = (e) => {
    if (e.code !== "KeyR") return;

    const { draggingShip, dragOffset, myShips } = this.state;

    // Nothing in hand - random placement
    if (!draggingShip) {
      this.randomizeShips();
      return;
    }

    const nextOrientation = !draggingShip.isVertical;
    this.setState({
      draggingShip: { ...draggingShip, isVertical: nextOrientation },
      dragOffset: { x: dragOffset.y, y: dragOffset.x },
      myShips: myShips.map((s) => (s.id === draggingShip.id ? { ...s, isVertical: nextOrientation } : s)),
    });
  };

  /**
   * Places all ships randomly: for every ship tries random positions until one is valid.
   * @author xhaziyh00
   */
  randomizeShips = () => {
    const board = createEmptyBoard();

    const updatedShips = this.state.myShips.map((ship) => {
      let isVertical;
      let startX;
      let startY;

      // Repeat until the ship fits and touches nobody
      do {
        isVertical = Math.random() < 0.5;
        startX = Math.floor(Math.random() * (isVertical ? BOARD_SIZE - ship.size + 1 : BOARD_SIZE));
        startY = Math.floor(Math.random() * (isVertical ? BOARD_SIZE : BOARD_SIZE - ship.size + 1));
      } while (!this.canPlaceShip(startX, startY, ship.size, isVertical, board));

      for (let i = 0; i < ship.size; i++) {
        const curX = isVertical ? startX + i : startX;
        const curY = isVertical ? startY : startY + i;
        board[curX][curY].hasShip = true;
        board[curX][curY].shipId = String(ship.id);
      }

      return { ...ship, isVertical, isPlaced: true };
    });

    this.setState({
      boardData: board,
      myShips: updatedShips,
      currentHoveredCell: null,
    });
  };

  /**
   * Takes an already placed ship from the board: clears its cells and starts dragging it.
   * @author xslobok00
   */
  handlePlacedShipDragStart = (e, rowIndex, colIndex) => {
    const { boardData, myShips } = this.state;

    const targetShipId = boardData[rowIndex]?.[colIndex]?.shipId;
    if (!targetShipId) return;

    // ids can be strings or numbers, so compare them as strings
    const isTargetShip = (id) => String(id) === String(targetShipId);

    const originalShip = myShips.find((s) => isTargetShip(s.id));
    if (!originalShip) return;

    const shipCells = [];
    const newBoard = boardData.map((row, r) =>
      row.map((cell, c) => {
        if (isTargetShip(cell.shipId)) {
          shipCells.push({ row: r, col: c });
          return { hasShip: false, shipId: null, hit: false, miss: false };
        }
        return { ...cell };
      }),
    );

    const grabIndex = shipCells.findIndex(({ row, col }) => row === rowIndex && col === colIndex);
    const rect = e.currentTarget.getBoundingClientRect();
    this.setState({
      boardData: newBoard,
      myShips: myShips.map((s) => (isTargetShip(s.id) ? { ...s, isPlaced: true } : s)),
      draggingShip: { ...originalShip, isPlaced: true, grabIndex },
      dragOffset: {
        x: e.clientX - rect.left + (originalShip.isVertical ? 0 : grabIndex * rect.width),
        y: e.clientY - rect.top + (originalShip.isVertical ? grabIndex * rect.height : 0),
      },
      currentHoveredCell: { x: rowIndex, y: colIndex },
      mousePos: { x: e.clientX, y: e.clientY },
    });
  };

  /**
   * Sends the placed fleet to the server (10x10 matrix of ship ids / null) and starts the battle.
   * @author xslobok00
   */
  handleReadyToGo = async (boardData, ships) => {
    // Robot mode has no gameId here - App sends /ready itself
    if (!this.props.gameId) {
      this.props.onStartBattle?.(boardData, ships);
      return;
    }

    const payload = {
      board: boardData.map((row) => row.map((cell) => (cell.hasShip ? cell.shipId : null))),
    };

    try {
      const response = await fetch(`/api/games/${this.props.gameId}/ready`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          userId: this.props.userId,
        },
        body: JSON.stringify(payload),
      });

      // Server rejected the board
      if (!response.ok) {
        const data = await response.json();
        alert(data.error.message);
        return;
      }

      this.props.onStartBattle?.(boardData, ships, payload.board);
    } catch (err) {
      console.error("Network error on ready up", err);
      alert(err.message);
    }
  };

  /**
   * Renders the setup screen: header, player's board with the dock and the floating dragged ship.
   * @author xslobok00, xhaziyh00
   */
  render() {
    const { t } = this.context;
    const { draggingShip, dragOffset, mousePos, myShips, boardData, currentHoveredCell } = this.state;

    return (
      <>
        <Header onGoHome={this.props.onGoHome} isGetReady={true} />

        <div id="containerForField" className="fleet-setup">
          <Battlefield
            title={t("game.yourFleet")}
            isOpponent={false}
            isGetReadyScrn={true}
            ships={myShips}
            boardData={boardData}
            onShipDragStart={this.handleShipDragStart}
            onCellDragOver={this.handleCellDragOver}
            onPlacedShipDragStart={this.handlePlacedShipDragStart}
            onStartBattle={this.handleReadyToGo}
            containerRef={this.boardRef}
            draggingShip={draggingShip}
            currentHoveredCell={currentHoveredCell}
            canPlaceShip={this.canPlaceShip}
          />

          {/* Dragged ship that follows the cursor (xslobok00) */}
          {draggingShip && (
            <div
              style={{
                position: "fixed",
                pointerEvents: "none",
                left: `${mousePos.x - dragOffset.x}px`,
                top: `${mousePos.y - dragOffset.y}px`,
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
