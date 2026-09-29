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
import { SHIPS_CONFIG } from "../../constants.js";

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
  // author:xhaziyh00 - Initialize fleet state by decorating SHIPS_CONFIG templates with orientation and placement flags
  state = {
    myShips: SHIPS_CONFIG.map((ship) => ({
      ...ship,
      isVertical: false,
      isPlaced: false,
    })),
  };

  /**
   * Renders the game arena: top navigation header and side-by-side battlefields.
   *
   * @author xhaziyh00
   * @returns {JSX.Element} Full match screen layout.
   */
  render() {
    return (
      <div>
        {/* author:xhaziyh00 - Top navigation bar with return-to-home callback forwarding */}
        <Header onGoHome={this.props.onGoHome} />

        {/* author:xhaziyh00 - Side-by-side arena container: player's fleet on the left, opponent's grid on the right */}
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          {/* Player's board displaying own ship positions and reserve setup dock */}
          <Battlefield
            title="Your fleet"
            isOpponent={false}
            ships={this.state.myShips}
          />

          {/* Opponent's board with hidden ship positions, ready for targeting clicks */}
          <Battlefield title="Opponent" isOpponent={true} />
        </div>
      </div>
    );
  }
}

export default BatlleshipGame;
