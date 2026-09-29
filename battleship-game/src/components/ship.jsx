import React from 'react';

class Ship extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isHovered: false,
    };
  }
  render() {
    const { size, isVertical, isDraggable = false, onDragStart } = this.props;
    const sizeNum = Number(size) || 1;
    const vertical = isVertical === true || isVertical === 'true';
    const shipWidth = vertical ? 37 : 37 * sizeNum;
    const shipHeight = vertical ? 37 * sizeNum : 37;
    const { isHovered } = this.state;
    return (
      <div
        draggable={isDraggable}
        onDragStart={onDragStart}
        style={{
          display: 'flex',
          flexDirection: isVertical ? 'column' : 'row',
          width: 'fit-content',
          height: 'fit-content',
          cursor: isDraggable ? 'grab' : 'default',
        }}>
        <div
          onMouseEnter={() => this.setState({ isHovered: true })}
          onMouseLeave={() => this.setState({ isHovered: false })}
          style={{
            width: `${shipWidth - 6}px`,
            height: `${shipHeight - 6}px`,
            backgroundColor: 'rgba(169, 198, 210, 1)',
            border: isHovered ? '1px solid rgba(55, 95, 118, 1)' : '1px solid transparent',
            borderRadius: '5px',
            flexShrink: 0,
          }}></div>
      </div>
    );
  }
}

export default Ship;
