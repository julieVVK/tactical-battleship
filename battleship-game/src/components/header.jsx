import React, { useState } from 'react';
import { TURN_MESSAGES } from '../constants';
import '../styles/header.css';
class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      turnStatus: 'my_turn',
    };
  }
  render() {
    return (
      <div className="headerDiv">
        <div style={{ border: '3px', padding: '24px', justifySelf: 'start' }}>
          <button id="homeButton">Home</button>
        </div>
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <h1>Battleships</h1>
          <p>{TURN_MESSAGES[this.state.turnStatus]}</p>
        </div>
      </div>
    );
  }
}
export default Header;
