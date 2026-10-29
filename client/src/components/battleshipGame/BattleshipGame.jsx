/**
 * @file BattleshipGame.jsx
 * @description Main gameplay controller component. Manages the dual-board arena layout,
 * initializes enemy fleet state from SHIPS_CONFIG, and coordinates communication
 * between the navigation Header and both Battlefield grids.
 * @author xhaziyh00
 */

// Edited by Vladyslav Doroshenko
//     - Added language context

import { LanguageContext } from '../../i18n/LanguageContext.js';
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
 * @property {Object} state - Component internal state.
 */

class BatlleshipGame extends React.Component {
  static contextType = LanguageContext;

  constructor(props) {
    super(props);
    this.state = {
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
    const { t } = this.context;
    console.log("Battlefield received boardData:", this.state.boardData);
    return (
      <div>
        <Header />

        <div style={{ textAlign: "center", margin: "10px 0" }}>
          <p
            style={{ fontSize: "14px", color: "#666", marginBottom: "5px" }}
          ></p>
        </div>

        {/* author:xhaziyh00 - Side-by-side arena container: player's fleet on the left, opponent's grid on the right */}

        <div className="battleContainer">
          {/* Player's board displaying own ship positions and reserve setup dock */}
          <Battlefield
            title={t('game.yourFleet')}
            isOpponent={false}
            isGetReadyScrn={false}
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
          <Battlefield title={t('game.opponent')} isOpponent={true} />
        </div>
      </div>
    );
  }
}
export default BatlleshipGame;
