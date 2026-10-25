/**
 * @file Header.jsx
 * @description Header component for the BattleShip game screen.
 * Displays navigation controls to return to the main menu and shows the current turn status.
 * @author xhaziyh00
 */

// Edited by Vladislav Doroshenko
//     - Added foreign languages support
//       Changed lines: 12, 26, 42, 48, 53, 54

import { LanguageContext } from '../../i18n/LanguageContext.js';
import React from "react";
import { TURN_MESSAGES } from "../../constants";
import "./header.css";
/**
 * Header class component.
 *
 * @author xhaziyh00
 * @property {Object} props - Component input properties.
 * @property {Function} props.onGoHome - Callback function to navigate back to the main menu.
 * @property {Object} state - Component internal state.
 * @property {string} state.turnStatus - Key representing the current turn phase for the TURN_MESSAGES mapping.
 */
class Header extends React.Component {
  static contextType = LanguageContext;

  /**
   * Renders the header layout.
   *
   * @author xhaziyh00
   * @returns {JSX.Element} Header layout with navigation and turn status display.
   */
  render() {
    const { t } = this.context;
    return (
      <div className="headerDiv">
        <div className="buttonContainer">
          {/* author:xhaziyh00 - Navigation section: button to return home */}
          <button id="homeButton" onClick={this.props.onGoHome}>
            {t('nav.home')}
          </button>
        </div>
        <div className="textContainer">
          {/* author:xhaziyh00 - Information section: title and dynamic turn status text */}
          <h1>{t('app.title')}</h1>
          <p>{this.props.message || t(TURN_MESSAGES[this.props.turnStatus || "waiting"])}</p>
        </div>
      </div>
    );
  }
}
export default Header;
