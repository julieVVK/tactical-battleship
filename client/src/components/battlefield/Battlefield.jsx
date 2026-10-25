/**
 * @file Battlefield.jsx
 * @description Renders the 10x10 game board, axis labels (A-J, 1-10), cell click/drop handlers,
 * hit/miss visual markers, and the reserve ship dock for the fleet preparation phase.
 * @author xhaziyh00
 */

import React from "react";
import { LETTERS, NUMBERS, GADGETS } from "../../constants";
import BattleShip from "../battleship/BattleShip.jsx";
import EnemyShipsList from "../battleshipGame/EnemyShipsList.jsx"; //xslobok00: component of enemies
import "./battlefield.css";

/**
 * Battlefield class component.
 *
 * @author xhaziyh00
 * @property {Object} props - Component properties.
 * @property {string} props.title - Field title ("Your fleet", "Opponent").
 * @property {boolean} props.isOpponent - True for enemy field (hides ships, enables targeting clicks).
 * @property {Array<Array<Object>>} [props.boardData] - 10x10 matrix holding cell statuses (hasShip, hit, miss).
 * @property {Array<Object>} [props.ships=[]] - Array of player ships for the setup dock.
 * @property {Function} [props.onCellClick] - Callback triggered when a cell is clicked.
 * @property {Function} [props.onCellDragOver] - HTML5 drag-over callback for ship placement.
 * @property {Function} [props.onCellDrop] - HTML5 drop callback for ship placement.
 * @property {Function} [props.onShipDragStart] - Callback when dragging a ship begins.
 */
class Battlefield extends React.Component {
  /**
   * Handles keyboard arrow navigation across the 10x10 opponent grid.
   *
   * @author xhaziyh00
   * @param {KeyboardEvent} e - Native keyboard event.
   * @param {number} rowIndex - Current row index (0-9).
   * @param {number} colIndex - Current column index (0-9).
   */
  handleCellKeyDown = (e, rowIndex, colIndex) => {
    const { isOpponent } = this.props;
    if (!isOpponent) return;

    let nextRow = rowIndex;
    let nextCol = colIndex;

    switch (e.key) {
      case "ArrowUp":
        nextRow = Math.max(0, rowIndex - 1);
        break;
      case "ArrowDown":
        nextRow = Math.min(9, rowIndex + 1);
        break;
      case "ArrowLeft":
        nextCol = Math.max(0, colIndex - 1);
        break;
      case "ArrowRight":
        nextCol = Math.min(9, colIndex + 1);
        break;
      default:
        return;
    }

    e.preventDefault();

    const targetButton = document.getElementById(`cell-${nextRow}-${nextCol}`);
    if (targetButton) {
      targetButton.focus();
    }
  };
  /**
   * Handles user click on a cell (e.g., firing a shot).
   *
   * @author xhaziyh00
   * @param {number} rowIndex - Row coordinate (0-9).
   * @param {number} colIndex - Column coordinate (0-9).
   */
  handleCellClick = (rowIndex, colIndex) => {
    const { onCellClick } = this.props;
    if (onCellClick) onCellClick(rowIndex, colIndex);
  };

  /**
   * Prevents default browser dragover to allow dropping ships on player's own grid.
   *
   * @author xhaziyh00
   * @param {DragEvent} e - Native drag event.
   * @param {number} rowIndex - Target row.
   * @param {number} colIndex - Target column.
   */
  handleDragOver = (e, rowIndex, colIndex) => {
    const { isOpponent, onCellDragOver } = this.props;
    if (!isOpponent && onCellDragOver) {
      e.preventDefault();
      onCellDragOver(e, rowIndex, colIndex);
    }
  };

  /**
   * Handles ship placement drop on the player's grid.
   *
   * @author xhaziyh00
   * @param {DragEvent} e - Native drop event.
   * @param {number} rowIndex - Target row.
   * @param {number} colIndex - Target column.
   */
  handleDrop = (e, rowIndex, colIndex) => {
    const { isOpponent, onCellDrop } = this.props;

    if (!isOpponent && onCellDrop) {
      e.preventDefault();
      onCellDrop(e, rowIndex, colIndex);
    }
  };

  /**
   * Initiates drag event when taking a ship from the reserve dock.
   *
   * @author xhaziyh00
   * @param {DragEvent} e - Native dragstart event.
   * @param {Object} ship - Ship object configuration.
   */
  handleShipDragStart = (e, ship) => {
    const { onShipDragStart } = this.props;

    const img = new Image();
    img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    e.dataTransfer.setDragImage(img, 0, 0);

    if (onShipDragStart) onShipDragStart(e, ship);
  };
  isShipPristine = (shipId) => {
    const { boardData } = this.props;

    if (!boardData || !shipId) return false;
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        if (String(boardData[r][c]?.shipId) === String(shipId) && boardData[r][c]?.hit) return false;
      }
    }
    return true;
  };
  state = {
    activeTarget: null, // { rowIndex, colIndex } | null
  };

  /**
   * Renders coordinate axes, 10x10 cell grid, and available ship reserve dock.
   *
   * @author xhaziyh00
   * @returns {JSX.Element} Grid board element.
   */
  render() {
    const {
      title,
      isOpponent,
      isGetReadyScrn,
      boardData,
      ships = [],

      draggingShip,
      currentHoveredCell,
      canPlaceShip,
    } = this.props;
    const shouldDraw = isGetReadyScrn || !isOpponent;

    const CellTag = isOpponent ? "button" : "div";

    const unplacedShips = ships.filter((ship) => !ship.isPlaced);

    const allPlaced = ships.length > 0 && unplacedShips.length === 0;

    return (
      <div className="mainField">
        {/* author:xhaziyh00 - Grid header / ownership label */}
        <p className="owner">{title}</p>

        {/* author:xhaziyh00 - Top horizontal coordinate axis (Numbers 1-10) with 37x37px corner spacer */}
        <div style={{ display: "flex", marginTop: "18px" }}>
          {/* author:xhaziyh00 empty div for correct possition of coords*/}
          <div className="coords"></div>{" "}
          {NUMBERS.map((num) => (
            <div className="coords" key={num}>
              {num}
            </div>
          ))}
        </div>

        {/* author:xhaziyh00 - Main battlefield area: vertical letters (A-J) + 10x10 grid */}
        <div style={{ display: "flex" }}>
          {/* Left vertical coordinate axis (Letters A-J) */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {LETTERS.map((letter) => (
              <div className="coords" key={letter}>
                {letter}
              </div>
            ))}
          </div>

          {/* 100-cell grid container */}
          <div
            className="grid-container"
            ref={this.props.containerRef}
            onMouseLeave={() => {
              if (this.props.onCellDragOver) {
                this.props.onCellDragOver(null, null, null);
              }
            }}>
            {LETTERS.map((letter, rowIndex) =>
              NUMBERS.map((num, colIndex) => {
                const cell = boardData ? boardData[rowIndex][colIndex] : null;
                // author:xhaziyh00 - Ships are visible on player's board, but hidden on opponent's unless hit
                const isShipVisible = (!isOpponent && cell?.hasShip) || (isOpponent && cell?.hasShip && cell?.hit);
                const canGrabShip = isGetReadyScrn || (this.props.relocationMode && this.isShipPristine(cell?.shipId));

                //xslobok00:Layout Error Highlighting
                let isUnderDraggingShip = false;
                let isUnderShipZone = false;
                let isInvalidPlace = false;
                // author:xhaziyh00 - Check if mine is hovering over this cell
                const isMineDrag = this.props.draggingGadget === "mine";
                const isHovered = currentHoveredCell?.x === rowIndex && currentHoveredCell?.y === colIndex;

                // author:xhaziyh00 - radar
                const isRadarDrag = this.props.draggingGadget === "radar";
                let isRadarHover = false;

                if (isOpponent && isRadarDrag && currentHoveredCell) {
                  if (Math.abs(rowIndex - currentHoveredCell.x) <= 1 && Math.abs(colIndex - currentHoveredCell.y) <= 1) {
                    isRadarHover = true;
                  }
                }

                const scannedZone = (this.props.scannedZones || []).find((z) => Math.abs(rowIndex - z.row) <= 1 && Math.abs(colIndex - z.col) <= 1);
                const isZoneCenter = scannedZone && scannedZone.row === rowIndex && scannedZone.col === colIndex;

                if (shouldDraw && draggingShip && currentHoveredCell) {
                  const startX = currentHoveredCell.x;
                  const startY = currentHoveredCell.y;

                  //xslobok00: We checkif the cell (rowIndex, colIndex) is part of the ship
                  for (let i = 0; i < draggingShip.size; i++) {
                    const shipCellX = draggingShip.isVertical ? startX + i : startX;
                    const shipCellY = draggingShip.isVertical ? startY : startY + i;

                    if (shipCellX === rowIndex && shipCellY === colIndex) {
                      isUnderDraggingShip = true;
                    }

                    if (Math.abs(shipCellX - rowIndex) <= 1 && Math.abs(shipCellY - colIndex) <= 1) {
                      isUnderShipZone = true;
                    }
                  }

                  //xslobok00: If the cell falls under the ship, we check whether it can be placed there.
                  if (isUnderShipZone && canPlaceShip) {
                    if (startX >= 0 && startX < 10 && startY >= 0 && startY < 10) {
                      const isValid = canPlaceShip(startX, startY, draggingShip.size, draggingShip.isVertical, boardData);
                      if (!isValid) {
                        isInvalidPlace = true;
                      }
                    } else {
                      isInvalidPlace = true;
                    }
                  }
                }

                //xslobok00:cell color
                let cellBackground = "var(--page-bg)";
                let cellBackgroundImage = "none";
                if (isOpponent && (isRadarHover || scannedZone)) {
                  cellBackground = "rgba(0, 255, 255, 0.2)";
                } else if (!isOpponent && isMineDrag && isHovered) {
                  if (!cell?.hasShip && !cell?.hasMine) {
                    cellBackground = "rgba(46, 204, 113, 0.4)";
                  } else {
                    cellBackground = "rgba(235, 94, 94, 0.4)";
                  }
                } else if (isShipVisible) {
                  cellBackground = "var(--ship-bg)";

                  if (isUnderShipZone && isInvalidPlace) {
                    cellBackgroundImage = "repeating-linear-gradient(45deg, rgba(235,94,94,0.4), rgba(235,94,94,0.4) 6px, rgba(0,0,0,0) 6px, rgba(0,0,0,0) 12px)";
                  }
                } else if (isUnderShipZone && isInvalidPlace) {
                  if (isUnderDraggingShip) {
                    cellBackground = "rgba(235, 94, 94, 0.5)";
                    cellBackgroundImage = "repeating-linear-gradient(45deg, rgba(235,94,94,0.6), rgba(235,94,94,0.6) 6px, rgba(0,0,0,0) 6px, rgba(0,0,0,0) 12px)";
                  } else {
                    cellBackground = "rgba(235, 94, 94, 0.15)";
                  }
                } else if (isUnderShipZone) {
                  if (isUnderDraggingShip) {
                    cellBackground = "rgba(46, 204, 113, 0.4)";
                  } else {
                    cellBackground = "rgba(46, 204, 113, 0.12)";
                  }
                }

                return (
                  <CellTag
                    className={`cell ${!isOpponent && this.props.relocationMode && cell?.hasShip && this.isShipPristine(cell.shipId) ? "blinking-ship" : ""}`}
                    id={isOpponent ? `cell-${rowIndex}-${colIndex}` : undefined}
                    key={`${letter}-${num}`}
                    onClick={() => this.handleCellClick(rowIndex, colIndex)}

                    onMouseEnter={(e) => {
                      // xslobok00:coords with dragging
                      if (this.props.onCellDragOver) {
                        this.props.onCellDragOver(e, rowIndex, colIndex);
                      }
                    }}

                    draggable={!isOpponent && cell?.hasShip && canGrabShip}

                    onMouseDown={(e) => {
                      if (!isOpponent && cell?.hasShip && canGrabShip) {
                        e.preventDefault();
                        if (this.props.onPlacedShipDragStart) {
                          this.props.onPlacedShipDragStart(e, rowIndex, colIndex);
                        }
                      }
                    }}

                    onDrop={(e) => this.handleDrop(e, rowIndex, colIndex)}
                    onDragOver={(e) => e.preventDefault()}
                    onKeyDown={!shouldDraw ? (e) => this.handleCellKeyDown(e, rowIndex, colIndex) : undefined}

                    style={{
                      backgroundColor: cellBackground,
                      backgroundImage: cellBackgroundImage,
                      cursor: !shouldDraw ? "pointer" : "default",
                    }}>
                    {/* if radar scanned */}
                    {isZoneCenter && isOpponent && <span className="radar-percent">{scannedZone.percent}%</span>}

                    {/* if has mine */}
                    {cell?.hasMine && !isOpponent && <span className="mineIcon">{GADGETS.find((g) => g.id === "mine")?.icon}</span>}

                    {/* Hit marker */}
                    {cell?.hit && <span className="hitCell">✕</span>}

                    {/* Miss marker */}
                    {cell?.miss && <span className="missCell">•</span>}
                  </CellTag>
                );
              }),
            )}
          </div>
        </div>

        {/* author:xhaziyh00 - Dock container for unplaced ships during setup phase (own fleet only) */}

        <div
          className="info"
          style={
            !isGetReadyScrn
              ? {
                  backgroundColor: "transparent",
                  border: "none",
                  boxShadow: "none",
                }
              : undefined
          }>
          {isGetReadyScrn &&
            (!allPlaced ? (
              ships
                .filter((ship) => !ship.isPlaced)
                .map((ship) => (
                  <BattleShip key={ship.id} size={ship.size} isVertical={ship.isVertical} isDraggable={true} onDragStart={(e) => this.handleShipDragStart(e, ship)} />
                ))
            ) : (
              <button
                className="readyToGoButton"

                onClick={() => {
                  if (this.props.onStartBattle) {
                    this.props.onStartBattle(boardData, ships);
                  }
                }}>
                Ready to go
              </button>
            ))}

          {!isGetReadyScrn &&
            !isOpponent &&
            GADGETS.map((gadget) => {
              const isUsed = (this.props.usedGadgets || []).includes(gadget.id);

              return (
                <button
                  className="gadgetButton"
                  key={gadget.id}
                  title={`${gadget.name}:\n${gadget.desc}`}

                  onMouseDown={(e) => {
                    if (!isUsed && this.props.onSelectAbility) {
                      this.props.onSelectAbility(e, gadget.id);
                    }
                  }}

                  style={{
                    cursor: isUsed ? "not-allowed" : gadget.id === "relocate" ? "pointer" : "grab",
                    opacity: isUsed ? 0.4 : 1,
                    backgroundColor: gadget.id === "relocate" && this.props.relocationMode ? "rgba(0, 150, 255, 0.2)" : undefined,
                    border: gadget.id === "relocate" && this.props.relocationMode ? "2px solid #0096ff" : undefined,
                  }}>
                  {gadget.icon}
                </button>
              );
            })}

          {!isGetReadyScrn && isOpponent && <EnemyShipsList enemyShips={this.props.enemyShips} />}
        </div>
      </div>
    );
  }
}

export default Battlefield;
