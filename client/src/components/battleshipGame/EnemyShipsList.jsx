// File was created by xslobok00

// Edited by Vladyslav Doroshenko
//     - Added foreign languages support
//       Changed lines: 11, 14, 22

import { LanguageContext } from '../../i18n/LanguageContext.js';
import React from "react";
import "./enemyShipsList.css";

class EnemyShipsList extends React.Component {
    static contextType = LanguageContext;

    render() {
        const { t } = this.context;
        const {enemyShips = []} = this.props;

        // group by size 4 to 1
        const sizes = [4, 3, 2, 1];

        return (
            <div className="enemy-ships-tracker">
                <h3>{t('game.enemyShips')}</h3>
                <div className="ships-grid">
                    {sizes.map((size) => {
                        // how many ships are alive
                        const totalOfSize = enemyShips.filter(s => s.size === size);
                        const aliveOfSize = totalOfSize.filter(s => !s.isKilled && !s.isSunk);

                        return (
                            <div key={size} className={`ship-status-row ${aliveOfSize.length === 0 ? 'all-dead' : ''}`}>
                                {/* visual of ships */}
                                <div className="ship-preview">
                                    {Array.from({length: size}).map((_, i) => (
                                        <div key={i} className="ship-cube"></div>
                                    ))}
                                </div>
                                {/* how many ships left */}
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
