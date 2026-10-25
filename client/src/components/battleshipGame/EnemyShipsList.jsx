// File was created by xslobok00

import React from "react";
import {SHIPS_CONFIG} from "../../constants.js";
import "./enemyShipsList.css";

class EnemyShipsList extends React.Component {
    render() {
        const {shots} = this.props;

        // grorp by size 4 to 1
        const sizes = [4, 3, 2, 1];

        return (
            <div className="enemy-ships-tracker">
                <h3>Enemy Ships</h3>
                <div className="ships-grid">
                    {sizes.map((size) => {
                        // how many ships are alive
                        const total = SHIPS_CONFIG.filter(ship => ship.size === size).length;
                        const sunk = shots.filter(shot => shot.result === "sunk" && shot.cells.length === size).length;
                        const alive = total - sunk;

                        return (
                            <div key={size} className={`ship-status-row ${alive === 0 ? 'all-dead' : ''}`}>
                                {/* visual of ships */}
                                <div className="ship-preview">
                                    {Array.from({length: size}).map((_, i) => (
                                        <div key={i} className="ship-cube"></div>
                                    ))}
                                </div>
                                {/* how many ships left */}
                                <span className="ship-count">
                                    {alive} / {total}
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
