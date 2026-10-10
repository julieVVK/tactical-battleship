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
import EnemyShipsList from "./EnemyShipsList.jsx"; //xslobok00: component of enemies
import { SHIPS_CONFIG } from "../../constants.js";
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

    const emptyBoard = Array(10)
      .fill(null)
      .map(() =>
        Array(10)
          .fill(null)
          .map(() => ({ hasShip: false, hit: false, miss: false })),
      );

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
    };
  }

  /**
   * Renders the game arena: top navigation header and side-by-side battlefields.
   *
   * @author xhaziyh00
   * @returns {JSX.Element} Full match screen layout.
   */

  render() {
    console.log("Battlefield received boardData:", this.state.boardData);
    return (
      <div>
        {/* author:xhaziyh00 - Top navigation bar with return-to-home callback forwarding */}
        <Header onGoHome={this.props.onGoHome} />

        <div style={{ textAlign: "center", margin: "10px 0" }}>
          <p
            style={{ fontSize: "14px", color: "#666", marginBottom: "5px" }}
          ></p>
        </div>

        {/* author:xhaziyh00 - Side-by-side arena container: player's fleet on the left, opponent's grid on the right */}

        <div className="battleContainer">
          {/* Player's board displaying own ship positions and reserve setup dock */}
          <Battlefield
            title="Your fleet"
            isOpponent={false}
            isGetReadyScrn={false}
            ships={this.state.myShips}
            boardData={this.state.boardData}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <EnemyShipsList enemyShips={this.state.enemyShips} />
          </div>

          {/* Opponent's board with hidden ship positions, ready for targeting clicks */}
          <Battlefield title="Opponent" isOpponent={true} />
        </div>
      </div>
    );
  }
}
export default BatlleshipGame;
