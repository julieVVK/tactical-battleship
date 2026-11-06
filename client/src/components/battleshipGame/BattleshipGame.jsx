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

  /**
   * Initializes both boards, gadgets and drag-and-drop state.
   * @author xhaziyh00
   */
  constructor(props) {
    super(props);

    this.playerBoardRef = React.createRef();
    this.opponentBoardRef = React.createRef();

    this.state = {
      myShips: props.myShips,
      boardData: props.initialBoardData,
      opponentBoard: createEmptyOpponentBoard(),
      usedGadgets: [],
      scannedZones: [],

      draggingGadget: null,
      draggingShip: null,
      originalCells: null,
      relocationMode: false,
      mousePos: { x: 0, y: 0 },
      currentHoveredCell: null,
      hoveredField: null, // "player" | "opponent" | null
    };
  }

  /**
   * Registers window listeners and restores radar results after a page reload.
   * @author xhaziyh00
   */
  componentDidMount() {
    window.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("mouseup", this.handleGlobalMouseUp);
    window.addEventListener("keydown", this.handleKeyDown);

    const scannedZones = this.props.gameState?.players?.you?.scannedZones;
    if (scannedZones?.length > 0) {
      this.setState({ scannedZones });
    }
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
    const players = this.props.gameState?.players;
    const prevPlayers = prevProps.gameState?.players;

    const myShots = players?.you?.shots || [];
    const opponentShots = players?.opponent?.shots || [];
    const scannedZones = players?.you?.scannedZones || [];
    const opponentScannedZones = players?.opponent?.scannedZones || [];

    const prevMyShots = prevPlayers?.you?.shots || [];
    const prevOpponentShots = prevPlayers?.opponent?.shots || [];
    const prevOpponentScans = prevPlayers?.opponent?.scannedZones || [];

    const hasNewScannedZones = scannedZones.length > 0 && this.state.scannedZones.length === 0;
    const hasNewShots = myShots.length !== prevMyShots.length || opponentShots.length !== prevOpponentShots.length;
    const hasNewOpponentScans = opponentScannedZones.length !== prevOpponentScans.length;
    const isNewGameState = prevProps.gameState !== this.props.gameState;

    // Nothing new from the server - skip
    const shouldSync = this.props.gameState && (isNewGameState || hasNewShots || hasNewScannedZones || hasNewOpponentScans);
    if (!shouldSync) return;

    this.setState({
      opponentBoard: this.buildOpponentBoard(myShots),
      boardData: this.buildPlayerBoard(opponentShots, opponentScannedZones),
      ...(hasNewScannedZones && { scannedZones }),
    });
  }

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
   * Builds our board: applies opponent's radar scans and shots to the current board.
   * @author xhaziyh00, xslobok00
   */
  buildPlayerBoard = (opponentShots, opponentScannedZones) => {
    const board = copyBoard(this.state.boardData);

    // Cells where the enemy radar found our ship
    opponentScannedZones.forEach(({ row, col, hasShip }) => {
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
    opponentShots.forEach((shot) => {
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
        console.error(`Request "${path}" failed`, await response.text());
      }
    } catch (err) {
      console.error(`Network error on "${path}"`, err);
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
    const { draggingShip } = this.state;
    if (e.code !== "KeyR" || !draggingShip) return;

    this.setState({
      draggingShip: { ...draggingShip, isVertical: !draggingShip.isVertical },
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
    const { draggingShip, currentHoveredCell, hoveredField, boardData, originalCells, myShips } = this.state;
    const { size, isVertical, id } = draggingShip;
    const newBoard = copyBoard(boardData);

    const isOverOwnBoard = currentHoveredCell && hoveredField === "player";
    const isValidPlace = isOverOwnBoard && this.isMyTurn() && this.canPlaceShip(currentHoveredCell.x, currentHoveredCell.y, size, isVertical, boardData);

    const newCells = [];
    if (isValidPlace) {
      const { x, y } = currentHoveredCell;
      for (let i = 0; i < size; i++) {
        newCells.push(isVertical ? `${x + i}-${y}` : `${x}-${y + i}`);
      }
    }

    const isSamePosition = [...originalCells].sort().join(",") === [...newCells].sort().join(",");

    // Wrong place or the same place - put the ship back
    if (!isValidPlace || isSamePosition) {
      placeShipCells(newBoard, originalCells, id);
      this.setState({ boardData: newBoard, ...SHIP_DRAG_RESET });
      return;
    }

    placeShipCells(newBoard, newCells, id);
    const updatedShips = myShips.map((s) => (String(s.id) === String(id) ? { ...s, isVertical } : s));

    const [oldRow, oldCol] = originalCells[0].split("-").map(Number);

    this.setState(
      (prev) => ({
        boardData: newBoard,
        myShips: updatedShips,
        usedGadgets: [...prev.usedGadgets, "relocate"],
        ...SHIP_DRAG_RESET,
      }),
      () =>
        this.postGameAction("gadgets/relocate", {
          oldRow,
          oldCol,
          newRow: currentHoveredCell.x,
          newCol: currentHoveredCell.y,
          isVertical,
        }),
    );
  };

  /**
   * Finishes gadget drag: radar on the opponent's board, mine on our own free cell (only on our turn).
   * Otherwise the gadget stays available.
   * @author xhaziyh00
   */
  dropGadget = () => {
    const { draggingGadget, currentHoveredCell, hoveredField, boardData } = this.state;

    // Released outside of both boards
    if (!currentHoveredCell || !hoveredField) {
      this.setState(GADGET_DRAG_RESET);
      return;
    }

    const { x: row, y: col } = currentHoveredCell;

    const applyGadget = (extraState, path) =>
      this.setState(
        (prev) => ({
          ...extraState,
          usedGadgets: [...prev.usedGadgets, draggingGadget],
          ...GADGET_DRAG_RESET,
        }),
        () => this.postGameAction(path, { row, col }),
      );

    // Radar - scans 3x3 area on the opponent's board
    if (draggingGadget === "radar" && hoveredField === "opponent" && this.isMyTurn()) {
      applyGadget({}, "gadgets/radar");
      return;
    }

    // Mine - only on an empty, not shot cell
    const target = boardData[row][col];
    const isFreeCell = !target.hasShip && !target.hasMine && !target.hit && !target.miss;

    if (draggingGadget === "mine" && hoveredField === "player" && isFreeCell && this.isMyTurn()) {
      const newBoard = copyBoard(boardData);
      newBoard[row][col].hasMine = true;
      applyGadget({ boardData: newBoard }, "gadgets/mine");
      return;
    }

    this.setState(GADGET_DRAG_RESET);
  };

  /**
   * Gadget button pressed: "relocate" toggles relocation mode, other gadgets start dragging.
   * @author xhaziyh00
   */
  handleGadgetSelect = (e, gadgetId) => {
    e.preventDefault();

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

    this.setState({
      boardData: newBoard,
      draggingShip: { ...originalShip, isPlaced: true },
      originalCells,
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
    const { boardData, opponentBoard, usedGadgets, relocationMode, draggingShip, draggingGadget, currentHoveredCell, hoveredField, scannedZones, mousePos } =
      this.state;

    return (
      <div>
        <Header onGoHome={this.props.onGoHome} isGetReady={false} turnStatus={this.isMyTurn() ? "my_turn" : "opponent_turn"} />

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
              left: `${mousePos.x - SHIP_PREVIEW_OFFSET}px`,
              top: `${mousePos.y - SHIP_PREVIEW_OFFSET}px`,
            }}>
            <BattleShip size={draggingShip.size} isVertical={draggingShip.isVertical} isDraggable={false} />
          </div>
        )}
      </div>
    );
  }
}

export default BattleshipGame;
