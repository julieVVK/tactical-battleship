/**
 * @file header.jsx
 * @description Header component for the Battleship game screen.
 * Displays navigation controls to return to the main menu and shows the current turn status.
 * @author xhaziyh00
 */
import React, { useState } from "react";
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
  constructor(props) {
    super(props);
    // author:xhaziyh00 - Initialize local state with default turn status
    this.state = {
      turnStatus: "my_turn",
    };
  }
  /**
   * Renders the header layout.
   *
   * @author xhaziyh00
   * @returns {JSX.Element} Header layout with navigation and turn status display.
   */
  render() {
    return (
      <div className="headerDiv">
        <div style={{ border: "3px", padding: "24px", justifySelf: "start" }}>
          {/* author:xhaziyh00 - Navigation section: button to return home */}
          <button id="homeButton" onClick={this.props.onGoHome}>
            Home
          </button>
        </div>
        <div style={{ padding: "24px", textAlign: "center" }}>
          {/* author:xhaziyh00 - Information section: title and dynamic turn status text */}
          <h1>Battleships</h1>
          <p>{TURN_MESSAGES[this.state.turnStatus]}</p>
        </div>
      </div>
    );
  }
}
export default Header;
