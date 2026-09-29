/**
 * @file battlefield.jsx
 * @description Renders the 10x10 game board, axis labels (A-J, 1-10), cell click/drop handlers,
 * hit/miss visual markers, and the reserve ship dock for the fleet preparation phase.
 * @author xhaziyh00
 */

import React from "react";
import { LETTERS, NUMBERS } from "../../constants";
import Battleship from "../battleship/battleShip";
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
    if (onShipDragStart) onShipDragStart(e, ship);
  };

  /**
   * Renders coordinate axes, 10x10 cell grid, and available ship reserve dock.
   *
   * @author xhaziyh00
   * @returns {JSX.Element} Grid board element.
   */
  render() {
    const { title, isOpponent, boardData, ships = [] } = this.props;

    return (
      <div className="mainField">
        {/* author:xhaziyh00 - Grid header / ownership label */}
        <p className="owner">{title}</p>

        {/* author:xhaziyh00 - Top horizontal coordinate axis (Numbers 1-10) with 37x37px corner spacer */}
        <div style={{ display: "flex", marginTop: "18px" }}>
          <div style={{ width: "37px", height: "37px" }}></div>
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
          <div className="grid-container">
            {LETTERS.map((letter, rowIndex) =>
              NUMBERS.map((num, colIndex) => {
                const cell = boardData ? boardData[rowIndex][colIndex] : null;

                // author:xhaziyh00 - Ships are visible on player's board, but hidden on opponent's unless hit
                const isShipVisible =
                  (!isOpponent && cell?.hasShip) ||
                  (isOpponent && cell?.hasShip && cell?.hit);

                return (
                  <div
                    className="cell"
                    key={`${letter}-${num}`}
                    onClick={() => this.handleCellClick(rowIndex, colIndex)}
                    onDragOver={(e) =>
                      this.handleDragOver(e, rowIndex, colIndex)
                    }
                    onDrop={(e) => this.handleDrop(e, rowIndex, colIndex)}
                    style={{
                      backgroundColor: isShipVisible
                        ? "var(--ship-bg)"
                        : "var(--page-bg)",
                      cursor: isOpponent ? "pointer" : "default",
                    }}
                  >
                    {/* Hit marker */}
                    {cell?.hit && (
                      <span
                        style={{
                          color: "var(--hit-mark)",
                          fontSize: "24px",
                          fontWeight: "bold",
                        }}
                      >
                        ✕
                      </span>
                    )}

                    {/* Miss marker */}
                    {cell?.miss && (
                      <span
                        style={{
                          color: "var(--text-btn-color)",
                          fontSize: "18px",
                        }}
                      >
                        •
                      </span>
                    )}
                  </div>
                );
              }),
            )}
          </div>
        </div>

        {/* author:xhaziyh00 - Dock container for unplaced ships during setup phase (own fleet only) */}
        {!isOpponent && (
          <div className="info">
            {ships
              .filter((ship) => !ship.isPlaced)
              .map((ship) => (
                <Battleship
                  key={ship.id}
                  size={ship.size}
                  isVertical={ship.isVertical}
                  isDraggable={true}
                  onDragStart={(e) => this.handleShipDragStart(e, ship)}
                />
              ))}
          </div>
        )}
      </div>
    );
  }
}

export default Battlefield;
