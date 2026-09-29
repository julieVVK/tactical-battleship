import React from 'react';
import { LETTERS, NUMBERS } from '../constants';
import Ship from './ship';
import '../styles/battlefield.css';

class Battlefield extends React.Component {
  handleCellClick = (rowIndex, colIndex) => {
    const { onCellClick } = this.props;
    if (onCellClick) onCellClick(rowIndex, colIndex);
  };

  handleDragOver = (e, rowIndex, colIndex) => {
    const { isOpponent, onCellDragOver } = this.props;
    if (!isOpponent && onCellDragOver) {
      e.preventDefault();
      onCellDragOver(e, rowIndex, colIndex);
    }
  };

  handleDrop = (e, rowIndex, colIndex) => {
    const { isOpponent, onCellDrop } = this.props;
    if (!isOpponent && onCellDrop) {
      e.preventDefault();
      onCellDrop(e, rowIndex, colIndex);
    }
  };

  handleShipDragStart = (e, ship) => {
    const { onShipDragStart } = this.props;
    if (onShipDragStart) onShipDragStart(e, ship);
  };
  render() {
    const { title, isOpponent, boardData, ships = [] } = this.props;
    return (
      <div className="mainField">
        <p className="owner">{title}</p>
        <div style={{ display: 'flex', marginTop: '18px' }}>
          <div style={{ width: '37px', height: '37px' }}></div>
          {NUMBERS.map((num) => (
            <div className="coords" key={num}>
              {num}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {LETTERS.map((num) => (
              <div className="coords" key={num}>
                {num}
              </div>
            ))}
          </div>
          <div className="grid-container">
            {LETTERS.map((letter, rowIndex) =>
              NUMBERS.map((num, colIndex) => {
                const cell = boardData ? boardData[rowIndex][colIndex] : null;
                const isShipVisible =
                  (!isOpponent && cell?.hasShip) || (isOpponent && cell?.hasShip && cell?.hit);

                return (
                  <div
                    className="cell"
                    key={`${letter}-${num}`}
                    onClick={() => this.handleCellClick(rowIndex, colIndex)}
                    onDragOver={(e) => this.handleDragOver(e, rowIndex, colIndex)}
                    onDrop={(e) => this.handleDrop(e, rowIndex, colIndex)}
                    style={{
                      backgroundColor: isShipVisible ? '#8ea8be' : 'rgba(245, 243, 235, 1)',
                      cursor: isOpponent ? 'pointer' : 'default',
                    }}>
                    {cell?.hit && (
                      <span style={{ color: '#c25e4a', fontSize: '24px', fontWeight: 'bold' }}>
                        ✕
                      </span>
                    )}
                    {cell?.miss && <span style={{ color: '#688294', fontSize: '18px' }}>•</span>}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {!isOpponent && (
          <div className="info">
            {ships
              .filter((ship) => !ship.isPlaced)
              .map((ship) => (
                <Ship
                  key={ship.id}
                  size={ship.size}
                  isVertical={ship.isVertical}
                  isDraggable={true}
                  onDragStart={(e) => this.handleShipDragStart(e, ship)}
                />
              ))}
          </div>
        )}
      </div>
    );
  }
}

export default Battlefield;
