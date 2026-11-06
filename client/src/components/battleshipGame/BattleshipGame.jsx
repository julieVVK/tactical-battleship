/**
 * @file BattleshipGame.jsx
 * @description Battle screen: both boards, shots, gadgets and ship relocation.
 * The server is the source of truth - every move is a POST request, new state comes in `props.gameState`.
 * Coordinates: `x` = ROW, `y` = COLUMN.
 *
 * @author xhaziyh00, xslobok00
 */

// Edited by Vladyslav Doroshenko
//     - Added language context

import { LanguageContext } from "../../i18n/LanguageContext.js";
import React from "react";
import Header from "../header/Header.jsx";
import Battlefield from "../battlefield/Battlefield.jsx";
import BattleShip from "../battleship/BattleShip.jsx";
import { SHIPS_CONFIG, GADGETS, BOARD_SIZE } from "../../constants.js";
import "./battleshipGame.css";

const GADGET_PREVIEW_OFFSET = 30;
const SHIP_PREVIEW_OFFSET = 15;

const GADGET_DRAG_RESET = { draggingGadget: null, currentHoveredCell: null, hoveredField: null };
const SHIP_DRAG_RESET = { draggingShip: null, originalCells: null, currentHoveredCell: null, hoveredField: null };

/**
 * Returns true if the cell (row x, column y) is inside the board.
 * @author xhaziyh00
 */
const isInBounds = (x, y) => x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE;

/**
 * Creates an empty opponent board (we know only our shots there, not the ships).
 * @author xhaziyh00
 */
const createEmptyOpponentBoard = () =>
  Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => ({
      hit: false,
      miss: false,
    })),
  );

/**
 * Returns a copy of the board, so the state is never changed directly.
 * @author xhaziyh00
 */
const copyBoard = (board) => board.map((row) => row.map((cell) => ({ ...cell })));

/**
 * Puts a ship on the board copy. Cells are in "row-col" format, e.g. ["2-3", "2-4"].
 * @author xhaziyh00, xslobok00
 */
const placeShipCells = (board, cells, shipId) => {
  cells.forEach((coord) => {
    const [r, c] = coord.split("-").map(Number);
    board[r][c].hasShip = true;
    board[r][c].shipId = shipId;
  });
};

/**
 * Marks all cells around a sunk ship as misses - there can not be another ship.
 * @author xslobok00
 */
const markAroundSunkShip = (board, cells) => {
  cells.forEach(({ row, col }) => {
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const neighbourRow = row + dx;
        const neighbourCol = col + dy;

        if (isInBounds(neighbourRow, neighbourCol) && !board[neighbourRow][neighbourCol].hit) {
          board[neighbourRow][neighbourCol].miss = true;
        }
      }
    }
  });
};

/**
 * Finds the board cell under the cursor, or null if the cursor is not over the board.
 * @author xhaziyh00, xslobok00
 */
const getCellUnderCursor = (element, e) => {
  if (!element) return null;

  const rect = element.getBoundingClientRect();
  // Cursor is outside the board
  const isInside = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
  if (!isInside) return null;

  const cellSize = rect.width / BOARD_SIZE;
  return {
    x: Math.floor((e.clientY - rect.top) / cellSize),
    y: Math.floor((e.clientX - rect.left) / cellSize),
  };
};

/**
 * Battle screen component.
 * @author xhaziyh00, xslobok00
 */
class BattleshipGame extends React.Component {
  static contextType = LanguageContext;
  actionPending = false;

  /**
   * Initializes both boards, gadgets and drag-and-drop state.
   * @author xhaziyh00
   */
  constructor(props) {
    super(props);

    this.playerBoardRef = React.createRef();
    this.opponentBoardRef = React.createRef();

    this.state = {
      ...this.buildGameState(props.gameState),

      draggingGadget: null,
      draggingShip: null,
      dragOffset: { x: SHIP_PREVIEW_OFFSET, y: SHIP_PREVIEW_OFFSET },
      originalCells: null,
      relocationMode: false,
      mousePos: { x: 0, y: 0 },
      currentHoveredCell: null,
      hoveredField: null, // "player" | "opponent" | null
    };
  }

  /**
   * Registers window listeners.
   * @author xhaziyh00
   */
  componentDidMount() {
    window.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("mouseup", this.handleGlobalMouseUp);
    window.addEventListener("keydown", this.handleKeyDown);
  }

  /**
   * Removes window listeners.
   * @author xhaziyh00
   */
  componentWillUnmount() {
    window.removeEventListener("mousemove", this.handleMouseMove);
    window.removeEventListener("mouseup", this.handleGlobalMouseUp);
    window.removeEventListener("keydown", this.handleKeyDown);
  }

  /**
   * Rebuilds both boards every time the server sends a new game state.
   * @author xhaziyh00, xslobok00
   */
  componentDidUpdate(prevProps) {
    if (prevProps.gameState !== this.props.gameState) {
      this.syncGameState(this.props.gameState);
    }
  }

  syncGameState = (gameState) => {
    this.setState({
      ...this.buildGameState(gameState),
      ...SHIP_DRAG_RESET,
      ...GADGET_DRAG_RESET,
      relocationMode: false,
    });
  };

  // Ship ids are local to the board; relocation requests use coordinates.
  buildGameState = (gameState) => {
    const { you, opponent } = gameState.players;

    return {
      myShips: you.ships.map(({ cells }, index) => ({
        id: String(index + 1),
        size: cells.length,
        isVertical: cells.length > 1 && cells[0].col === cells[1].col,
        isPlaced: true,
      })),
      boardData: this.buildPlayerBoard(you, opponent),
      opponentBoard: this.buildOpponentBoard(you.shots),
      usedGadgets: [...you.usedGadgets],
      scannedZones: you.scannedZones,
    };
  };

  /**
   * Builds the opponent's board from our shots ({ row, col, result: "hit" | "sunk" | "miss", cells? }).
   * @author xslobok00
   */
  buildOpponentBoard = (myShots) => {
    const board = createEmptyOpponentBoard();

    myShots.forEach((shot) => {
      if (!isInBounds(shot.row, shot.col)) return;

      if (shot.result === "hit" || shot.result === "sunk") {
        board[shot.row][shot.col].hit = true;

        // Sunk ship - cells around it are surely empty
        if (shot.result === "sunk" && Array.isArray(shot.cells)) {
          markAroundSunkShip(board, shot.cells);
        }
      } else if (shot.result === "miss") {
        board[shot.row][shot.col].miss = true;
      }
    });

    return board;
  };

  /**
   * Builds our board from the server fleet, mine, radar scans and shots.
   * @author xhaziyh00, xslobok00
   */
  buildPlayerBoard = (player, opponent) => {
    const board = createEmptyOpponentBoard();

    player.ships.forEach(({ cells }, index) => {
      cells.forEach(({ row, col, hit }) => {
        board[row][col] = { ...board[row][col], hasShip: true, shipId: String(index + 1), hit };
      });
    });

    if (player.mine) {
      const { row, col, triggered } = player.mine;
      board[row][col].hasMine = true;
      board[row][col].miss = triggered;
    }

    // Cells where the enemy radar found our ship
    (opponent?.scannedZones ?? []).forEach(({ row, col, hasShip }) => {
      if (hasShip && isInBounds(row, col)) {
        board[row][col].isScanned = true;
      }
    });

    // One scanned cell = whole ship is found (it can not be relocated anymore)
    const scannedShipIds = new Set(
      board
        .flat()
        .filter((cell) => cell.isScanned && cell.shipId)
        .map((cell) => String(cell.shipId)),
    );
    board.forEach((row) =>
      row.forEach((cell) => {
        if (cell.shipId && scannedShipIds.has(String(cell.shipId))) {
          cell.isScanned = true;
        }
      }),
    );

    // Opponent's shots
    (opponent?.shots ?? []).forEach((shot) => {
      if (shot.result === "hit" || shot.result === "sunk") {
        board[shot.row][shot.col].hit = true;
      }
      if (shot.result === "sunk" && Array.isArray(shot.cells)) {
        markAroundSunkShip(board, shot.cells);
      }
      if (shot.result === "miss") {
        board[shot.row][shot.col].miss = true;
      }
    });

    return board;
  };

  /**
   * Returns true if it is our turn now.
   * @author xhaziyh00
   */
  isMyTurn = () => this.props.turnPlayerId == this.props.userId;

  /**
   * Sends a POST request to /api/games/{gameId}/{path}. The result comes back in props.gameState.
   * @author xhaziyh00
   */
  postGameAction = async (path, body) => {
    if (this.actionPending) return;
    this.actionPending = true;
    const { gameId, userId } = this.props;

    try {
      const response = await fetch(`/api/games/${gameId}/${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          userId: userId,
        },
        body: JSON.stringify(body),
      });

      // Server rejected the action
      if (!response.ok) {
        const data = await response.json();
        alert(data.error.message);
        return;
      }

      if (path.startsWith("gadgets/")) {
        this.syncGameState(await response.json());
      }

      // Robot mode has no socket - ask App to reload the game state
      await this.props.onActionDone?.();
    } catch (err) {
      console.error(`Network error on "${path}"`, err);
      alert(err.message);
    } finally {
      this.actionPending = false;
    }
  };

  /**
   * While something is dragged: moves the floating picture and finds the hovered cell on either board.
   * @author xhaziyh00, xslobok00
   */
  handleMouseMove = (e) => {
    if (!this.state.draggingGadget && !this.state.draggingShip) return;

    this.setState({ mousePos: { x: e.clientX, y: e.clientY } });

    // Our board first, then the opponent's board
    const playerCell = getCellUnderCursor(this.playerBoardRef.current, e);
    const opponentCell = playerCell ? null : getCellUnderCursor(this.opponentBoardRef.current, e);
    const cell = playerCell || opponentCell;

    if (cell && isInBounds(cell.x, cell.y)) {
      this.setState({
        currentHoveredCell: cell,
        hoveredField: playerCell ? "player" : "opponent",
      });
    } else {
      this.setState({ currentHoveredCell: null, hoveredField: null });
    }
  };

  /**
   * Rotates the relocated ship on R (e.code works with any keyboard layout).
   * @author xhaziyh00, xslobok00
   */
  handleKeyDown = (e) => {
    const { draggingShip, dragOffset } = this.state;
    if (e.code !== "KeyR" || !draggingShip) return;

    this.setState({
      draggingShip: { ...draggingShip, isVertical: !draggingShip.isVertical },
      dragOffset: { x: dragOffset.y, y: dragOffset.x },
    });
  };

  /**
   * Checks if a ship can be placed: inside the board, not on a mine, not touching other ships.
   * @author xhaziyh00, xslobok00
   */
  canPlaceShip = (startX, startY, size, isVertical, board) => {
    if (!board) return false;

    for (let i = 0; i < size; i++) {
      const currentX = isVertical ? startX + i : startX;
      const currentY = isVertical ? startY : startY + i;
      // Out of the board, on a mine or on an already shot cell
      if (!isInBounds(currentX, currentY)) return false;
      if (board[currentX][currentY]?.hasMine) return false;
      if (board[currentX][currentY]?.miss) return false;
      if (board[currentX][currentY]?.hit) return false;

      // Any of 8 neighbours belongs to another ship
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const checkX = currentX + dx;
          const checkY = currentY + dy;

          if (isInBounds(checkX, checkY) && board[checkX][checkY]?.hasShip) return false;
        }
      }
    }

    return true;
  };

  /**
   * Mouse released anywhere on the page - finishes the current drag operation.
   * @author xhaziyh00, xslobok00
   */
  handleGlobalMouseUp = () => {
    if (this.state.draggingShip) {
      this.dropRelocatedShip();
    } else if (this.state.draggingGadget) {
      this.dropGadget();
    }
  };

  /**
   * Finishes ship relocation: valid new place -> ship is moved and gadget is used,
   * wrong or the same place -> ship goes back and gadget stays available.
   * @author xhaziyh00, xslobok00
   */
  dropRelocatedShip = () => {
    const { draggingShip, currentHoveredCell, hoveredField, boardData, originalCells } = this.state;
    const { size, isVertical, id, grabIndex = 0 } = draggingShip;
    const newBoard = copyBoard(boardData);

    const isOverOwnBoard = currentHoveredCell && hoveredField === "player";
    const start = currentHoveredCell && {
      x: currentHoveredCell.x - (isVertical ? grabIndex : 0),
      y: currentHoveredCell.y - (isVertical ? 0 : grabIndex),
    };
    const isValidPlace = isOverOwnBoard && this.isMyTurn() && this.canPlaceShip(start.x, start.y, size, isVertical, boardData);

    const newCells = [];
    if (isValidPlace) {
      const { x, y } = start;
      for (let i = 0; i < size; i++) {
        newCells.push(isVertical ? `${x + i}-${y}` : `${x}-${y + i}`);
      }
    }

    const isSamePosition = [...originalCells].sort().join(",") === [...newCells].sort().join(",");

    // Keep the original position until the server accepts the relocation.
    placeShipCells(newBoard, originalCells, id);
    this.setState({ boardData: newBoard, ...SHIP_DRAG_RESET });
    if (!isValidPlace || isSamePosition) return;

    const [oldRow, oldCol] = originalCells[0].split("-").map(Number);

    return this.postGameAction("gadgets/relocate", {
      oldRow,
      oldCol,
      newRow: start.x,
      newCol: start.y,
      isVertical,
    });
  };

  /**
   * Finishes gadget drag: radar on the opponent's board, mine on our own free cell (only on our turn).
   * Otherwise the gadget stays available.
   * @author xhaziyh00
   */
  dropGadget = () => {
    const { draggingGadget, currentHoveredCell, hoveredField, boardData } = this.state;
    this.setState(GADGET_DRAG_RESET);

    // Released outside of both boards
    if (!currentHoveredCell || !hoveredField) {
      return;
    }

    const { x: row, y: col } = currentHoveredCell;

    // Radar - scans 3x3 area on the opponent's board
    if (draggingGadget === "radar" && hoveredField === "opponent" && this.isMyTurn()) {
      return this.postGameAction("gadgets/radar", { row, col });
    }

    // Mine - only on an empty, not shot cell
    const target = boardData[row][col];
    const isFreeCell = !target.hasShip && !target.hasMine && !target.hit && !target.miss;

    if (draggingGadget === "mine" && hoveredField === "player" && isFreeCell && this.isMyTurn()) {
      return this.postGameAction("gadgets/mine", { row, col });
    }
  };

  /**
   * Gadget button pressed: "relocate" toggles relocation mode, other gadgets start dragging.
   * @author xhaziyh00
   */
  handleGadgetSelect = (e, gadgetId) => {
    e.preventDefault();
    if (this.actionPending || this.state.usedGadgets.includes(gadgetId)) return;

    if (gadgetId === "relocate") {
      this.setState((prev) => ({ relocationMode: !prev.relocationMode }));
      return;
    }

    this.setState({
      draggingGadget: gadgetId,
      mousePos: { x: e.clientX, y: e.clientY },
    });
  };

  /**
   * Takes a placed ship for relocation. Its cells are saved in `originalCells` to put it back on a wrong drop.
   * @author xhaziyh00, xslobok00
   */
  handlePlacedShipDragStart = (e, rowIndex, colIndex) => {
    if (this.actionPending) return;
    const { boardData, myShips = [] } = this.state;

    const targetShipId = boardData[rowIndex]?.[colIndex]?.shipId;
    if (!targetShipId) return;

    // ids can be strings or numbers, so compare them as strings
    const isTargetShip = (shipId) => String(shipId) === String(targetShipId);

    const originalShip = myShips.find((s) => isTargetShip(s.id));
    if (!originalShip) return;

    const originalCells = [];
    const newBoard = boardData.map((row, r) =>
      row.map((cell, c) => {
        if (!isTargetShip(cell.shipId)) return { ...cell };

        originalCells.push(`${r}-${c}`);
        return { ...cell, hasShip: false, shipId: null };
      }),
    );

    const grabIndex = originalCells.indexOf(`${rowIndex}-${colIndex}`);
    const rect = e.currentTarget.getBoundingClientRect();
    this.setState({
      boardData: newBoard,
      draggingShip: { ...originalShip, isPlaced: true, grabIndex },
      dragOffset: {
        x: e.clientX - rect.left + (originalShip.isVertical ? 0 : grabIndex * rect.width),
        y: e.clientY - rect.top + (originalShip.isVertical ? grabIndex * rect.height : 0),
      },
      originalCells,
      currentHoveredCell: { x: rowIndex, y: colIndex },
      hoveredField: "player",
      mousePos: { x: e.clientX, y: e.clientY },
      relocationMode: false,
    });
  };

  /**
   * Shot at the opponent's cell. The result comes back from the server in props.gameState.
   * @author xslobok00
   */
  handleShot = (row, col) => {
    const { userId, turnPlayerId, gameState } = this.props;
    const cell = this.state.opponentBoard?.[row]?.[col];

    // Block shot if the game hasn't started or it's not the player's turn
    if (!turnPlayerId || !this.isMyTurn()) return;
    if (cell?.miss || cell?.hit) return;

    // Do not shoot the same cell twice
    const myShots = gameState?.players?.you?.shots || [];
    const isAlreadyShot = myShots.some((shot) => shot.row === row && shot.col === col);
    if (isAlreadyShot) return;

    this.postGameAction("shots", { row, col });
  };

  /**
   * Calculates enemy ships state from our shots. Only the size of a sunk ship is known,
   * so the first not sunk ship of that size is marked.
   * @author xhaziyh00
   */
  getEnemyShips = () => {
    const myShots = this.props.gameState?.players?.you?.shots || [];
    const enemyShips = SHIPS_CONFIG.map((ship) => ({ ...ship, isSunk: false }));

    const sunkShots = myShots.filter((shot) => shot.result === "sunk" && Array.isArray(shot.cells));

    sunkShots.forEach((shot) => {
      const sunkSize = shot.cells.length;
      const targetShip = enemyShips.find((s) => s.size === sunkSize && !s.isSunk);
      if (targetShip) targetShip.isSunk = true;
    });

    return enemyShips;
  };

  /**
   * Renders the header, both boards and the floating dragged gadget / ship.
   * @author xhaziyh00, xslobok00
   */
  render() {
    const { t } = this.context;
    const { boardData, opponentBoard, usedGadgets, relocationMode, draggingShip, dragOffset, draggingGadget, currentHoveredCell, hoveredField, scannedZones, mousePos } =
      this.state;

    return (
      <div>
        <Header onGoHome={this.props.onGoHome} isGetReady={false} turnStatus={this.isMyTurn() ? "my_turn" : "opponent_turn"} gameState={this.props.gameState} userId={this.props.userId} />

        <div className="battleContainer">
          <Battlefield
            title={t("game.yourFleet")}
            isOpponent={false}
            isGetReadyScrn={false}
            boardData={boardData}
            usedGadgets={usedGadgets}
            onSelectAbility={this.handleGadgetSelect}
            relocationMode={relocationMode}
            onPlacedShipDragStart={this.handlePlacedShipDragStart}
            containerRef={this.playerBoardRef}
            draggingShip={draggingShip}
            canPlaceShip={this.canPlaceShip}
            currentHoveredCell={hoveredField === "player" ? currentHoveredCell : null}
            draggingGadget={draggingGadget}
          />

          <Battlefield
            title={t("game.opponent")}
            isOpponent={true}
            boardData={opponentBoard}
            enemyShips={this.getEnemyShips()}
            containerRef={this.opponentBoardRef}
            scannedZones={scannedZones}
            draggingGadget={draggingGadget}
            currentHoveredCell={hoveredField === "opponent" ? currentHoveredCell : null}
            canShoot={this.props.gameState.phase === "battle" && this.isMyTurn()}
            onCellClick={this.handleShot}
          />
        </div>

        {/* Dragged gadget that follows the cursor */}
        {draggingGadget && (
          <div
            id="draggingGadget"
            style={{
              left: `${mousePos.x - GADGET_PREVIEW_OFFSET}px`,
              top: `${mousePos.y - GADGET_PREVIEW_OFFSET}px`,
            }}>
            {GADGETS.find((g) => g.id === draggingGadget)?.icon}
          </div>
        )}

        {/* Relocated ship that follows the cursor */}
        {draggingShip && (
          <div
            id="draggingShip"
            style={{
              left: `${mousePos.x - dragOffset.x}px`,
              top: `${mousePos.y - dragOffset.y}px`,
            }}>
            <BattleShip size={draggingShip.size} isVertical={draggingShip.isVertical} isDraggable={false} />
          </div>
        )}
      </div>
    );
  }
}

export default BattleshipGame;
