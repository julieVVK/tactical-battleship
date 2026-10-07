/* author: Marie Pindorová xpindom00 */

import './rules.css';

export default function HowToPlay() {
  return (
    <div className="htp-wrap">
      <div className="top-bar">
        <button className="home-btn">‹ Home</button>
        <button className="avatar-btn" label="User profile">
          <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="8" r="4"></circle>
            <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7"></path>
          </svg>
        </button>
      </div>

      <h1>How to play</h1>
      <p className="subtitle">Find the enemy fleet. Sink every ship before your opponent sinks yours.</p>

      <div className="step-grid">
        <div className="step-card">
          <h2><span className="num">01</span> Your fleet</h2>
          <p className="lead">10 ships · 20 squares · One 10 × 10 board</p>
          <div className="fleet-row">
            <div className="ship-group">
              <div className="ship-cells">
                <div className="ship-cell"></div>
                <div className="ship-cell"></div>
                <div className="ship-cell"></div>
                <div className="ship-cell"></div>
              </div>
              <span className="ship-label">1 × 4 cells</span>
            </div>

            <div className="ship-group">
              <div className="ship-cells">
                <div className="ship-cell"></div>
                <div className="ship-cell"></div>
                <div className="ship-cell"></div>
              </div>
              <span className="ship-label">2 × 3 cells</span>
            </div>

            <div className="ship-group">
              <div className="ship-cells">
                <div className="ship-cell"></div>
                <div className="ship-cell"></div>
              </div>
              <span className="ship-label">3 × 2 cells</span>
            </div>

            <div className="ship-group">
              <div className="ship-cells">
                <div className="ship-cell"></div>
              </div>
              <span className="ship-label">4 × 1 cell</span>
            </div>
          </div>
        </div>

        <div className="step-card">
          <h2><span className="num">02</span> Place your ships</h2>
          <p>Place every ship horizontally or vertically.</p>
          <p>Keep all ships inside the board. They cannot overlap or touch, even at the corners.</p>
          <p>Your opponent cannot see your fleet.</p>
        </div>

        <div className="step-card">
          <h2><span className="num">03</span> Take your shot</h2>
          <p>Choose an untried square on the opponent's board.</p>
          <p>A hit gives you another shot. A miss passes the turn.</p>
          <p>A ship sinks when all of its squares have been hit.</p>
          <div className="shot-legend">
            <span className="hit">× Hit · Shoot again</span>
            <span className="miss">• Miss · Opponent's turn</span>
          </div>
        </div>

        <div className="step-card">
          <h2><span className="num">04</span> Win the battle</h2>
          <p>Your fleet shows your ships and incoming shots.</p>
          <p>Opponent shows the results of your own shots.</p>
          <p className="win">Sink all 10 enemy ships to win.</p>
        </div>
      </div>

      <div className="info-banner">
        <h3>Special abilities</h3>
        <p>Check an ability's description before using it. Radar scans and other past uses appear in Used abilities below each board.</p>
      </div>
    </div>
  );
}