import React from "react";
import "./enemyShipsList.css"; 

class EnemyShipsList extends React.Component {
  render() {
    const { enemyShips = [] } = this.props;

    // grorp by size 4 to 1 
    // 
    const sizes =[4, 3, 2, 1];

    return (
      <div className="enemy-ships-tracker">
        <h3>Enemy Ships</h3>
        <div className="ships-grid">
          {sizes.map((size) => {
            // how much ships are alive
            const totalOfSize = enemyShips.filter(s => s.size === size);
            const aliveOfSize = totalOfSize.filter(s => !s.isKilled && !s.isSunk);

            return (
              <div key={size} className={`ship-status-row ${aliveOfSize.length === 0 ? 'all-dead' : ''}`}>
                {/* visual of ships */}
                <div className="ship-preview">
                  {Array.from({ length: size }).map((_, i) => (
                    <div key={i} className="ship-cube"></div>
                  ))}
                </div>
                {/* how much ships left */}
                <span className="ship-count">
                  {aliveOfSize.length} / {totalOfSize.length}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

export default EnemyShipsList;
