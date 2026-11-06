/**
 * @file Header.jsx
 * @description Header component for the BattleShip game screen.
 * Displays navigation controls to return to the main menu and shows the current turn status.
 * @author xhaziyh00
 */

// Edited by Vladislav Doroshenko
//     - Added foreign languages support
//       Changed lines: 12, 26, 42, 48, 53, 54

import { LanguageContext } from "../../i18n/LanguageContext.js";
import React from "react";
import { Link } from "react-router";
import { TURN_MESSAGES } from "../../constants";
import "./header.css";
/**
 * Header class component.
 *
 * @author xhaziyh00
 * @property {Object} props - Component input properties.
 * @property {Object} state - Component internal state.
 * @property {string} state.turnStatus - Key representing the current turn phase for the TURN_MESSAGES mapping.
 */
class Header extends React.Component {
  static contextType = LanguageContext;

  constructor(props) {
    super(props);
    // author:xhaziyh00 - Initialize local state with default turn status
    this.state = {
      turnStatus: props.turnPlayerId,
      isGetReady: props.isGetReady,
    };
  }
  /**
   * Renders the header layout.
   *
   * @author xhaziyh00
   * @returns {JSX.Element} Header layout with navigation and turn status display.
   */
  render() {
    const { t } = this.context;
    const { gameState, gameView, userId, onGoHome } = this.props;
    const currentGameState = gameState || this.props.gameView;
    const isFinished = gameState?.phase === "finished";
    const isWinner = isFinished && gameState?.winnerPlayerId === userId;
    let statusKey = this.props.turnStatus;
    if (isFinished) {
      statusKey = isWinner ? "turn.won" : "turn.lost";
    }
    return (
    <>
      <div className="headerDiv">
        <div className="buttonContainer">
          {/* author:xhaziyh00 - Navigation section: button to return home */}
          <Link id="homeButton" to="/">
            {t("nav.home")}
          </Link>
        </div>
        <div className="textContainer">
          {/* author:xhaziyh00 - Information section: title and dynamic turn status text */}
          <h1>{t("app.title")}</h1>
          {!this.props.isGetReady && <p>{t(TURN_MESSAGES[this.props.turnStatus])}</p>}
        </div>
      </div>

      {isFinished && (
          <div className="game-over-modal-overlay">
            <div className="game-over-modal">
              <h2>{isWinner ? "You won!" : "You lost!"}</h2>
              <p>{isWinner ? "Congratulations, all enemy ships are sunk." : "Better luck next time!"}</p>
              {onGoHome ? (
                <button className="home-button" onClick={onGoHome}>
                  {t("nav.home")}
                </button>
              ) : (
                <Link className="home-button" to="/">
                  {t("nav.home")}
                </Link>
              )}
            </div>
          </div>
      )}
    </>
    );
  }
}
export default Header;
