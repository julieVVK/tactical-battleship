/**
 * @file BattleshipGame.jsx
 * @description Main gameplay controller component. Manages the dual-board arena layout,
 * initializes player fleet state from SHIPS_CONFIG, and coordinates communication
 * between the navigation Header and both Battlefield grids.
 * @author xhaziyh00
 */

import React from "react";
import Header from "../header/Header.jsx";
import Battlefield from "../battlefield/Battlefield.jsx";
import BattleShip from "../battleship/BattleShip.jsx";
import { SHIPS_CONFIG, GADGETS } from "../../constants.js";
import "./battleshipGame.css";
/**
 * BatlleshipGame class component.
 *
 * @author xhaziyh00
 * @property {Object} props - Component input properties.
 * @property {Function} props.onGoHome - Callback function to return to the main menu screen.
 * @property {Object} state - Component internal state.
 * @property {Array<Object>} state.myShips - Array of player ships initialized with placement and orientation flags.
 */

class BatlleshipGame extends React.Component {
  constructor(props) {
    super(props);
    // author:xhaziyh00 - Initialize fleet state by decorating SHIPS_CONFIG templates with orientation and placement flags

    this.playerBoardRef = React.createRef();
    this.opponentBoardRef = React.createRef();
    this.state = {
      myShips: SHIPS_CONFIG.map((ship) => ({
        ...ship,
        isVertical: false,
        isPlaced: false,
      })),

      enemyShips: SHIPS_CONFIG.map((ship) => ({
        //xslobok00: enemy ships
        ...ship,
        isKilled: false,
      })),
      boardData: props.initialBoardData,
      usedGadgets: [],
      scannedZones: [],
      draggingGadget: null,
      mousePos: { x: 0, y: 0 },
      currentHoveredCell: null,
      hoveredField: null,
    };
  }

  handleMouseMove = (e) => {
    if (!this.state.draggingGadget && !this.state.draggingShip) return;

    this.setState({ mousePos: { x: e.clientX, y: e.clientY } });

    let hoveredField = null;
    let targetX = null;
    let targetY = null;
    if (this.playerBoardRef.current) {
      const rect = this.playerBoardRef.current.getBoundingClientRect();
      if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
        hoveredField = "player";
        const cellSize = rect.width / 10;
        targetY = Math.floor((e.clientX - rect.left) / cellSize);
        targetX = Math.floor((e.clientY - rect.top) / cellSize);
      }
    }

    if (this.opponentBoardRef.current && !hoveredField) {
      const rect = this.opponentBoardRef.current.getBoundingClientRect();
      if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
        hoveredField = "opponent";
        const cellSize = rect.width / 10;
        targetY = Math.floor((e.clientX - rect.left) / cellSize);
        targetX = Math.floor((e.clientY - rect.top) / cellSize);
      }
    }

    if (hoveredField && targetX >= 0 && targetX < 10 && targetY >= 0 && targetY < 10) {
      this.setState({
        currentHoveredCell: { x: targetX, y: targetY },
        hoveredField: hoveredField,
      });
    } else {
      this.setState({ currentHoveredCell: null, hoveredField: null });
    }
  };
  handleKeyDown = (e) => {
    if (e.code === "KeyR") {
      const { draggingShip } = this.state;
      if (draggingShip) {
        this.setState({
          draggingShip: {
            ...draggingShip,
            isVertical: !draggingShip.isVertical,
          },
        });
      }
    }
  };

  canPlaceShip = (startX, startY, size, isVertical, board) => {
    if (!board) return false;
    for (let i = 0; i < size; i++) {
      let currentX = isVertical ? startX + i : startX;
      let currentY = isVertical ? startY : startY + i;

      if (currentX < 0 || currentX >= 10 || currentY < 0 || currentY >= 10) return false;

      if (board[currentX][currentY]?.hasMine) return false;

      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          let checkX = currentX + dx;
          let checkY = currentY + dy;
          if (checkX >= 0 && checkX < 10 && checkY >= 0 && checkY < 10) {
            if (board[checkX][checkY]?.hasShip) return false;
          }
        }
      }
    }
    return true;
  };

  handleGlobalMouseUp = () => {
    const { draggingGadget, draggingShip, currentHoveredCell, hoveredField, boardData, originalCells, myShips } = this.state;

    if (draggingShip) {
      let targetX,
        targetY,
        isVertical = draggingShip.isVertical;
      let isValidPlace = false;

      if (currentHoveredCell && hoveredField === "player") {
        targetX = currentHoveredCell.x;
        targetY = currentHoveredCell.y;
        isValidPlace = this.canPlaceShip(targetX, targetY, draggingShip.size, isVertical, boardData);
      }

      const newBoard = boardData.map((row) => row.map((cell) => ({ ...cell })));

      if (isValidPlace) {
        let newCells = [];
        for (let i = 0; i < draggingShip.size; i++) {
          let curX = isVertical ? targetX + i : targetX;
          let curY = isVertical ? targetY : targetY + i;
          newCells.push(`${curX}-${curY}`);
        }

        const isSamePosition = originalCells.sort().join(",") === newCells.sort().join(",");

        if (isSamePosition) {
          originalCells.forEach((coord) => {
            const [r, c] = coord.split("-").map(Number);
            newBoard[r][c].hasShip = true;
            newBoard[r][c].shipId = draggingShip.id;
          });

          this.setState({
            boardData: newBoard,
            draggingShip: null,
            originalCells: null,
            currentHoveredCell: null,
            hoveredField: null,
          });
        } else {
          newCells.forEach((coord) => {
            const [r, c] = coord.split("-").map(Number);
            newBoard[r][c].hasShip = true;
            newBoard[r][c].shipId = draggingShip.id;
          });

          const updatedShips = myShips.map((s) => (String(s.id) === String(draggingShip.id) ? { ...s, isVertical: isVertical } : s));

          this.setState(
            (prev) => ({
              boardData: newBoard,
              myShips: updatedShips,
              draggingShip: null,
              originalCells: null,
              currentHoveredCell: null,
              hoveredField: null,
              usedGadgets: [...prev.usedGadgets, "relocate"],
            }),
            () => {
              const [oldRow, oldCol] = originalCells[0].split("-").map(Number);

              const payload = {
                gameId: this.props.gameId,
                playerId: this.props.userId,
                oldRow: oldRow,
                oldCol: oldCol,
                newRow: targetX,
                newCol: targetY,
                isVertical: isVertical,
              };

              console.log("push relocation on server:", payload);
              this.props.socket.emit("relocateShip", payload);
            },
          );
        }
      } else {
        originalCells.forEach((coord) => {
          const [r, c] = coord.split("-").map(Number);
          newBoard[r][c].hasShip = true;
          newBoard[r][c].shipId = draggingShip.id;
        });

        this.setState({
          boardData: newBoard,
          draggingShip: null,
          originalCells: null,
          currentHoveredCell: null,
          hoveredField: null,
        });
      }
      return;
    }

    if (draggingGadget) {
      if (!currentHoveredCell || !hoveredField) {
        this.setState({
          draggingGadget: null,
          currentHoveredCell: null,
          hoveredField: null,
        });
        return;
      }

      if (draggingGadget === "radar" && hoveredField === "opponent") {
        const targetX = currentHoveredCell.x;
        const targetY = currentHoveredCell.y;

        this.setState(
          (prev) => ({
            usedGadgets: [...prev.usedGadgets, draggingGadget],
            draggingGadget: null,
            currentHoveredCell: null,
            hoveredField: null,
          }),
          () => {
            const payload = {
              gameId: this.props.gameId,
              playerId: this.props.userId,
              row: targetX,
              col: targetY,
            };
            console.log("push radar on server:", payload);
            this.props.socket.emit("useRadar", payload);
          },
        );
      } else if (draggingGadget === "mine" && hoveredField === "player") {
        // author:xhaziyh00 - Mine placement logic and validation
        const targetX = currentHoveredCell.x;
        const targetY = currentHoveredCell.y;

        if (!boardData[targetX][targetY].hasShip && !boardData[targetX][targetY].hasMine) {
          const newBoard = boardData.map((row) => row.map((cell) => ({ ...cell })));
          newBoard[targetX][targetY].hasMine = true;

          this.setState(
            (prev) => ({
              boardData: newBoard,
              usedGadgets: [...prev.usedGadgets, draggingGadget],
              draggingGadget: null,
              currentHoveredCell: null,
              hoveredField: null,
            }),
            () => {
              const payload = {
                gameId: this.props.gameId,
                playerId: this.props.userId,
                row: targetX,
                col: targetY,
              };
              console.log("push mine on server:", payload);
              this.props.socket.emit("placeMine", payload);
            },
          );
        } else {
          this.setState({
            draggingGadget: null,
            currentHoveredCell: null,
            hoveredField: null,
          });
        }
      } else {
        this.setState({
          draggingGadget: null,
          currentHoveredCell: null,
          hoveredField: null,
        });
      }
    }
  };

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

  handlePlacedShipDragStart = (e, rowIndex, colIndex) => {
    const { boardData, myShips } = this.state;
    const targetShipId = boardData[rowIndex]?.[colIndex]?.shipId;

    if (!targetShipId) return;

    const originalShip = myShips.find((s) => String(s.id) === String(targetShipId));
    if (!originalShip) return;

    let originalCells = [];
    const newBoard = boardData.map((row, r) =>
      row.map((cell, c) => {
        if (String(cell.shipId) === String(targetShipId)) {
          originalCells.push(`${r}-${c}`);
          return { ...cell, hasShip: false, shipId: null };
        }
        return { ...cell };
      }),
    );

    this.setState({
      boardData: newBoard,
      draggingShip: { ...originalShip, isPlaced: true },
      originalCells: originalCells,
      mousePos: { x: e.clientX, y: e.clientY },
      relocationMode: false,
    });
  };

  componentDidMount() {
    window.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("mouseup", this.handleGlobalMouseUp);
    window.addEventListener("keydown", this.handleKeyDown);
    // this.props.socket.on("radarResult", (data) =>
    //   this.setState((prev) => ({ scannedZones: [...prev.scannedZones, data] })),
    // );
  }

  componentWillUnmount() {
    window.removeEventListener("mousemove", this.handleMouseMove);
    window.removeEventListener("mouseup", this.handleGlobalMouseUp);
    window.removeEventListener("keydown", this.handleKeyDown);
  }

  /**
   * Renders the game arena: top navigation header and side-by-side battlefields.
   *
   * @author xhaziyh00
   * @returns {JSX.Element} Full match screen layout.
   */

  render() {
    return (
      <div>
        <Header onGoHome={this.props.onGoHome} />

        <div className="battleContainer">
          <Battlefield
            title="Your fleet"
            isOpponent={false}
            isGetReadyScrn={false}
            ships={this.state.myShips}
            boardData={this.state.boardData}
            usedGadgets={this.state.usedGadgets}
            onSelectAbility={this.handleGadgetSelect}
            relocationMode={this.state.relocationMode}
            onPlacedShipDragStart={this.handlePlacedShipDragStart}
            containerRef={this.playerBoardRef}
            draggingShip={this.state.draggingShip}
            canPlaceShip={this.canPlaceShip}
            currentHoveredCell={this.state.hoveredField === "player" ? this.state.currentHoveredCell : null}
            draggingGadget={this.state.draggingGadget}
          />

          <Battlefield
            title="Opponent"
            isOpponent={true}
            enemyShips={this.state.enemyShips}
            containerRef={this.opponentBoardRef}
            scannedZones={this.state.scannedZones}
            draggingGadget={this.state.draggingGadget}
            currentHoveredCell={this.state.hoveredField === "opponent" ? this.state.currentHoveredCell : null}
          />
        </div>

        {/* just dragging icon */}
        {this.state.draggingGadget && (
          <div
            id="draggingGadget"
            style={{
              left: `${this.state.mousePos.x - 30}px`,
              top: `${this.state.mousePos.y - 30}px`,
            }}>
            {GADGETS.find((g) => g.id === this.state.draggingGadget)?.icon}
          </div>
        )}

        {/* same for ship relocation  */}
        {this.state.draggingShip && (
          <div
            id="draggingShip"
            style={{
              left: `${this.state.mousePos.x - 15}px`,
              top: `${this.state.mousePos.y - 15}px`,
            }}>
            <BattleShip size={this.state.draggingShip.size} isVertical={this.state.draggingShip.isVertical} isDraggable={false} />
          </div>
        )}
      </div>
    );
  }
}
export default BatlleshipGame;
