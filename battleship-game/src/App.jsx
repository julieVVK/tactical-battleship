import React from 'react';
import Header from './components/header.jsx';
import Battlefield from './components/battlefield.jsx';
import { SHIPS_CONFIG } from './constants';
class App extends React.Component {
  state = {
    myShips: SHIPS_CONFIG.map((ship) => ({
      ...ship,
      isVertical: false,
      isPlaced: false,
    })),
  };
  render() {
    return (
      <div>
        <Header />
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <Battlefield title="Your fleet" isOpponent={false} ships={this.state.myShips} />
          <Battlefield title="Opponent" isOpponent={true} />
        </div>
      </div>
    );
  }
}
export default App;
