/**
 * @file battleShip.jsx
 * @description Ship component representing an individual vessel on the grid or in the reserve container.
 * Handles drag-and-drop initiation, orientation (horizontal/vertical), hover highlighting,
 * and proportional dimension calculation based on cell size (37px).
 * @author xhaziyh00
 */
import React from "react";

/**
 * Battleship class component.
 *
 * @author xhaziyh00
 * @property {Object} props - Component properties.
 * @property {number|string} [props.size=1] - Number of cells the ship occupies (decks).
 * @property {boolean|string} [props.isVertical=false] - Ship orientation (vertical if true, horizontal if false).
 * @property {boolean} [props.isDraggable=false] - Enables drag-and-drop capability.
 * @property {Function} [props.onDragStart] - Callback triggered when dragging starts.
 * @property {Object} state - Component state.
 * @property {boolean} state.isHovered - Tracks mouse hover status for border highlighting.
 */
class Battleship extends React.Component {
  constructor(props) {
    super(props);
    // author:xhaziyh00 - Local state to manage hover border styling
    this.state = {
      isHovered: false,
    };
  }
  /**
   * Renders the ship element with dynamic dimensions based on deck count and orientation.
   *
   * @author xhaziyh00
   * @returns {JSX.Element} Draggable or static styled ship element.
   */

  render() {
    const { size, isVertical, isDraggable = false, onDragStart } = this.props;
    // author:xhaziyh00 - Sanitize size input and ensure a fallback to 1 deck
    const sizeNum = Number(size) || 1;
    // author:xhaziyh00 - Normalize orientation check to accept both boolean and string values
    const vertical = isVertical === true || isVertical === "true";
    // author:xhaziyh00 - Compute dimensions matching the 37px grid cell scale
    // If vertical: width is 1 cell (37px), height spans (37 * size) px
    // If horizontal: width spans (37 * size) px, height is 1 cell (37px)
    const shipWidth = vertical ? 37 : 37 * sizeNum;
    const shipHeight = vertical ? 37 * sizeNum : 37;
    const { isHovered } = this.state;
    return (
      // author:xhaziyh00 - Outer wrapper managing layout flow and native HTML5 drag events
      <div
        draggable={isDraggable}
        onDragStart={onDragStart}
        style={{
          display: "flex",
          flexDirection: isVertical ? "column" : "row",
          width: "fit-content",
          height: "fit-content",
          cursor: isDraggable ? "grab" : "default",
        }}
      >
        {/* 
          author:xhaziyh00 - Inner visual ship body:
          - (shipWidth - 6px) and (shipHeight - 6px) leave a 3px inset padding inside grid cells.
          - Colors use global theme variables defined in :root (--ship-bg and --ship-border).
          - Border switches to active accent on hover to indicate interactability.
        */}
        <div
          onMouseEnter={() => this.setState({ isHovered: true })}
          onMouseLeave={() => this.setState({ isHovered: false })}
          style={{
            width: `${shipWidth - 6}px`,
            height: `${shipHeight - 6}px`,
            backgroundColor: "var(--ship-bg)",
            border: isHovered
              ? "1px solid var(--ship-border)"
              : "1px solid transparent",
            borderRadius: "5px",
            flexShrink: 0,
          }}
        ></div>
      </div>
    );
  }
}

export default Battleship;
