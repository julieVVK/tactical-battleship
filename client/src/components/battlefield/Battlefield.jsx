/**
 * @file Battlefield.jsx
 * @description 10x10 board with axes, markers and the bottom panel. Used for three boards:
 *   setup screen (isGetReadyScrn), own board in game (isOpponent = false), opponent's board (isOpponent = true).
 * Coordinates: `x` = ROW, `y` = COLUMN.
 *
 * @author xhaziyh00, xslobok00
 */

import React from "react";
import { LETTERS, NUMBERS, GADGETS, BOARD_SIZE } from "../../constants";
import BattleShip from "../battleship/BattleShip.jsx";
import Button from "../button/Button.jsx";
import EnemyShipsList from "../battleshipGame/EnemyShipsList.jsx";
import { LanguageContext } from "../../i18n/LanguageContext.js";
import "./battlefield.css";

const MINE_ICON = GADGETS.find((g) => g.id === "mine")?.icon;
const EXPLODED_MINE_ICON = "💥";

// Cell highlight colors (green = OK, red = not allowed, cyan = radar)
const COLORS = {
  default: "var(--page-bg)",
  ship: "var(--ship-bg)",
  radar: "rgba(0, 255, 255, 0.2)",
  valid: "rgba(46, 204, 113, 0.4)",
  validZone: "rgba(46, 204, 113, 0.12)",
  invalid: "rgba(235, 94, 94, 0.4)",
  invalidShip: "rgba(235, 94, 94, 0.5)",
  invalidZone: "rgba(235, 94, 94, 0.15)",
};

/**
 * Red diagonal stripes pattern for a wrong ship placement.
 * @author xslobok00
 */
const stripes = (alpha) => {
  const red = `rgba(235,94,94,${alpha})`;
  return `repeating-linear-gradient(45deg, ${red}, ${red} 6px, rgba(0,0,0,0) 6px, rgba(0,0,0,0) 12px)`;
};

/**
 * Returns true if the cell (row x, column y) is inside the board.
 * @author xhaziyh00
 */
const isInBounds = (x, y) => x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE;

/**
 * Returns true if two cells touch each other (same cell or one of 8 neighbours).
 * @author xhaziyh00, xslobok00
 */
const isNeighbour = (x1, y1, x2, y2) => Math.abs(x1 - x2) <= 1 && Math.abs(y1 - y2) <= 1;

/**
 * Game board component.
 * @author xhaziyh00, xslobok00
 */
class Battlefield extends React.Component {
  static contextType = LanguageContext;

  /**
   * Arrow keys move focus across the opponent's grid.
   * @author xhaziyh00
   */
  handleCellKeyDown = (e, rowIndex, colIndex) => {
    if (!this.props.isOpponent) return;

    const lastIndex = BOARD_SIZE - 1;
    let nextRow = rowIndex;
    let nextCol = colIndex;

    switch (e.key) {
      case "ArrowUp":
        nextRow = Math.max(0, rowIndex - 1);
        break;
      case "ArrowDown":
        nextRow = Math.min(lastIndex, rowIndex + 1);
        break;
      case "ArrowLeft":
        nextCol = Math.max(0, colIndex - 1);
        break;
      case "ArrowRight":
        nextCol = Math.min(lastIndex, colIndex + 1);
        break;
      default:
        return;
    }

    // Stop page scrolling and move focus to the neighbour cell
    e.preventDefault();
    document.getElementById(`cell-${nextRow}-${nextCol}`)?.focus();
  };

  /**
   * Cell click - shot at the opponent's cell.
   * @author xslobok00
   */
  handleCellClick = (rowIndex, colIndex) => {
    this.props.onCellClick?.(rowIndex, colIndex);
  };

  /**
   * Takes a ship from the dock. Native HTML5 drag is blocked (it freezes mouse events),
   * dragging is done with window mouse events in the parent.
   * @author xslobok00
   */
  handleShipGrab = (e, ship) => {
    e.preventDefault();
    this.props.onShipDragStart?.(e, ship);
  };

  /**
   * Returns true if the ship was not hit and not found by radar (only such ships can be relocated).
   * @author xhaziyh00
   */
  isShipPristine = (shipId) => {
    const { boardData } = this.props;
    if (!boardData || !shipId) return false;

    for (const row of boardData) {
      for (const cell of row) {
        const isThisShip = String(cell?.shipId) === String(shipId);
        if (isThisShip && (cell.hit || cell.isScanned)) return false;
      }
    }
    return true;
  };

  /**
   * Computes how the dragged ship preview affects the cell:
   * under the ship / in the zone around it / ship can not be placed here.
   * @author xslobok00, xhaziyh00
   */
  getPlacementPreview = (rowIndex, colIndex) => {
    const { draggingShip, currentHoveredCell, canPlaceShip, boardData } = this.props;
    const preview = { isUnderDraggingShip: false, isUnderShipZone: false, isInvalidPlace: false };

    // Nothing is dragged or cursor is outside the board
    if (!draggingShip || !currentHoveredCell) return preview;

    const { isVertical, grabIndex = 0 } = draggingShip;
    const startX = currentHoveredCell.x - (isVertical ? grabIndex : 0);
    const startY = currentHoveredCell.y - (isVertical ? 0 : grabIndex);

    for (let i = 0; i < draggingShip.size; i++) {
      const shipCellX = draggingShip.isVertical ? startX + i : startX;
      const shipCellY = draggingShip.isVertical ? startY : startY + i;

      if (shipCellX === rowIndex && shipCellY === colIndex) {
        preview.isUnderDraggingShip = true;
      }
      if (isNeighbour(shipCellX, shipCellY, rowIndex, colIndex)) {
        preview.isUnderShipZone = true;
      }
    }

    // Cell is in the ship zone - check if the ship can be placed
    if (preview.isUnderShipZone && canPlaceShip) {
      const isStartInside = isInBounds(startX, startY);
      const canPlace = isStartInside && canPlaceShip(startX, startY, draggingShip.size, draggingShip.isVertical, boardData);
      preview.isInvalidPlace = !canPlace;
    }

    return preview;
  };

  /**
   * Picks the cell background. First match wins:
   * radar hover > radar result > mine hover > visible ship > placement preview > default.
   * @author xslobok00, xhaziyh00
   */
  getCellBackground = ({ cell, isShipVisible, isRadarHover, scannedCell, isMineHover, preview }) => {
    const { isOpponent } = this.props;
    const { isUnderDraggingShip, isUnderShipZone, isInvalidPlace } = preview;
    const isInvalidZone = isUnderShipZone && isInvalidPlace;

    // Radar is being aimed at this 3x3 area
    if (isOpponent && isRadarHover) {
      return { color: COLORS.radar };
    }

    // Radar already scanned this cell (green = ship found)
    if (isOpponent && scannedCell) {
      return { color: scannedCell.hasShip ? COLORS.valid : COLORS.radar };
    }

    // Mine is being placed (green = free cell, red = occupied)
    if (!isOpponent && isMineHover) {
      const isFree = !cell?.hasShip && !cell?.hasMine;
      return { color: isFree ? COLORS.valid : COLORS.invalid };
    }

    // Ship cell (red stripes if the dragged ship would touch it)
    if (isShipVisible) {
      return { color: COLORS.ship, image: isInvalidZone ? stripes(0.4) : undefined };
    }

    // Dragged ship preview - wrong place
    if (isInvalidZone) {
      if (isUnderDraggingShip) {
        return { color: COLORS.invalidShip, image: stripes(0.6) };
      }
      return { color: COLORS.invalidZone };
    }

    // Dragged ship preview - good place
    if (isUnderShipZone) {
      return { color: isUnderDraggingShip ? COLORS.valid : COLORS.validZone };
    }

    return { color: COLORS.default };
  };

  /**
   * Renders one cell with its background and markers (mine, hit, miss).
   * @author xhaziyh00, xslobok00
   */
  renderCell = (rowIndex, colIndex, shouldDraw) => {
    const { isOpponent, isGetReadyScrn = false, boardData, currentHoveredCell, draggingGadget, relocationMode, scannedZones = [], canShoot } = this.props;

    const CellTag = isOpponent ? "button" : "div";
    const cell = boardData ? boardData[rowIndex][colIndex] : null;

    // Own ships are visible, opponent's only when hit
    const isShipVisible = Boolean(cell?.hasShip && (!isOpponent || cell.hit));

    // Ship can be taken: always on the setup screen, in game only in relocation mode and if untouched
    const isPristine = relocationMode && this.isShipPristine(cell?.shipId);
    const canGrabShip = !isOpponent && cell?.hasShip && (isGetReadyScrn || isPristine);
    const isBlinking = !isOpponent && cell?.hasShip && isPristine;

    const isHovered = currentHoveredCell?.x === rowIndex && currentHoveredCell?.y === colIndex;
    const isMineHover = draggingGadget === "mine" && isHovered;

    // Radar covers 3x3 cells around the cursor
    const isRadarHover = isOpponent && draggingGadget === "radar" && currentHoveredCell && isNeighbour(rowIndex, colIndex, currentHoveredCell.x, currentHoveredCell.y);
    const scannedCell = scannedZones.find((zone) => zone.row === rowIndex && zone.col === colIndex);

    const preview = shouldDraw ? this.getPlacementPreview(rowIndex, colIndex) : {};
    const background = this.getCellBackground({ cell, isShipVisible, isRadarHover, scannedCell, isMineHover, preview });

    return (
      <CellTag
        className={`cell ${isBlinking ? "blinking-ship" : ""}`}
        id={isOpponent ? `cell-${rowIndex}-${colIndex}` : undefined}
        key={`${LETTERS[rowIndex]}-${NUMBERS[colIndex]}`}
        onClick={() => this.handleCellClick(rowIndex, colIndex)}
        onMouseEnter={(e) => this.props.onCellDragOver?.(e, rowIndex, colIndex)}
        onMouseDown={(e) => {
          if (!canGrabShip) return;
          e.preventDefault();
          this.props.onPlacedShipDragStart?.(e, rowIndex, colIndex);
        }}
        onKeyDown={shouldDraw ? undefined : (e) => this.handleCellKeyDown(e, rowIndex, colIndex)}
        style={{
          backgroundColor: background.color,
          backgroundImage: background.image ?? "none",
          cursor: isOpponent && canShoot && !cell?.hit && !cell?.miss ? "pointer" : "default",
        }}>
        {cell?.hasMine && !isOpponent && <span className="mineIcon">{cell.miss ? EXPLODED_MINE_ICON : MINE_ICON}</span>}

        {cell?.hit && <span className="hitCell">✕</span>}

        {cell?.miss && !cell?.hasMine && <span className="missCell">•</span>}
      </CellTag>
    );
  };

  /**
   * Renders the setup dock: not placed ships, or the "start" button when the whole fleet is placed.
   * @author xslobok00
   */
  renderShipDock = () => {
    const { t } = this.context;
    const { ships = [], boardData, draggingShip } = this.props;

    const unplacedShips = ships.filter((ship) => !ship.isPlaced);
    const isFleetReady = ships.length > 0 && unplacedShips.length === 0 && !draggingShip;

    // All ships placed - show the start button
    if (isFleetReady) {
      return (
        <Button variant="dark" className="readyToGoButton" onClick={() => this.props.onStartBattle?.(boardData, ships)}>
          {t("game.start")}
        </Button>
      );
    }

    return unplacedShips.map((ship) => (
      <BattleShip
        key={ship.id}
        size={ship.size}
        isVertical={ship.isVertical}
        isDraggable={true}
        onMouseDown={(e) => this.handleShipGrab(e, ship)}
      />
    ));
  };

  /**
   * Renders gadget buttons (mine, relocate, radar). Every gadget can be used once per game.
   * @author xhaziyh00
   */
  renderGadgets = () => {
    const { t } = this.context;
    const { usedGadgets = [], relocationMode, onSelectAbility } = this.props;

    return GADGETS.map((gadget) => {
      const isUsed = usedGadgets.includes(gadget.id);

      // "relocate" is a toggle button (click), other gadgets are dragged onto the board
      const isRelocate = gadget.id === "relocate";
      const isActiveRelocate = isRelocate && relocationMode;

      let cursor = "grab";
      if (isUsed) cursor = "not-allowed";
      else if (isRelocate) cursor = "pointer";

      return (
        <button
          className="gadgetButton"
          key={gadget.id}
          title={`${t(gadget.nameKey)}:\n${t(gadget.descKey)}`}
          onMouseDown={(e) => {
            if (!isUsed) onSelectAbility?.(e, gadget.id);
          }}
          style={{
            cursor,
            opacity: isUsed ? 0.4 : 1,
            backgroundColor: isActiveRelocate ? "rgba(0, 150, 255, 0.2)" : undefined,
            border: isActiveRelocate ? "2px solid #0096ff" : undefined,
          }}>
          {gadget.icon}
        </button>
      );
    });
  };

  /**
   * Renders the title, coordinate axes, 10x10 grid and the bottom panel.
   * @author xhaziyh00, xslobok00
   */
  render() {
    const { t } = this.context;
    const { title, isOpponent, isGetReadyScrn = false } = this.props;

    const shouldDraw = isGetReadyScrn || !isOpponent;

    const hiddenInfoStyle = { backgroundColor: "transparent", border: "none", boxShadow: "none" };

    return (
      <div className="mainField">
        <p className="owner">{title}</p>

        {isGetReadyScrn && (
          <p className="placement-hint">{t("game.placementHint")}</p>
        )}

        {/* Numbers 1-10 */}
        <div style={{ display: "flex", marginTop: "18px" }}>
          <div className="coords"></div>
          {NUMBERS.map((num) => (
            <div className="coords" key={num}>
              {num}
            </div>
          ))}
        </div>

        <div style={{ display: "flex" }}>
          {/* Letters A-J */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {LETTERS.map((letter) => (
              <div className="coords" key={letter}>
                {letter}
              </div>
            ))}
          </div>

          {/* Leaving the grid resets the hovered cell */}
          <div className="grid-container" ref={this.props.containerRef} onMouseLeave={() => this.props.onCellDragOver?.(null, null, null)}>
            {LETTERS.map((_, rowIndex) => NUMBERS.map((_, colIndex) => this.renderCell(rowIndex, colIndex, shouldDraw)))}
          </div>
        </div>

        {/* Bottom panel: ship dock (setup) / gadgets (own board) / enemy fleet (opponent board) */}
        <div className="info" style={isGetReadyScrn ? undefined : hiddenInfoStyle}>
          {isGetReadyScrn && this.renderShipDock()}
          {!isGetReadyScrn && !isOpponent && this.renderGadgets()}
          {!isGetReadyScrn && isOpponent && <EnemyShipsList enemyShips={this.props.enemyShips} />}
        </div>
      </div>
    );
  }
}

export default Battlefield;
