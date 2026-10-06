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
      cellSize: 37,
    };
  }
  /**
   * Renders the ship element with dynamic dimensions based on deck count and orientation.
   *
   * @author xhaziyh00
   * @returns {JSX.Element} Draggable or static styled ship element.
   */

  componentDidMount() {
    this.updateCellSize();
    window.addEventListener("resize", this.updateCellSize);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateCellSize);
  }

  updateCellSize = () => {
    const rootStyles = window.getComputedStyle(document.documentElement);
    const rawSize = rootStyles.getPropertyValue("--cell-size");
    const parsedSize = parseInt(rawSize, 10);

    if (!isNaN(parsedSize) && parsedSize !== this.state.cellSize) {
      this.setState({ cellSize: parsedSize });
    }
  };
  render() {
    const { size, isVertical, isDraggable = false, onDragStart } = this.props;
    const { isHovered, cellSize } = this.state;

    // author:xhaziyh00 - Sanitize size input and ensure a fallback to 1 deck
    const sizeNum = Number(size) || 1;
    // author:xhaziyh00 - Normalize orientation check to accept both boolean and string values
    const vertical = isVertical === true || isVertical === "true";
    // author:xhaziyh00 - Compute dimensions matching the 37px grid cell scale
    // If vertical: width is 1 cell (37px), height spans (37 * size) px
    // If horizontal: width spans (37 * size) px, height is 1 cell (37px)

    const shipWidth = vertical ? cellSize : cellSize * sizeNum;
    const shipHeight = vertical ? cellSize * sizeNum : cellSize;
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
          pointerEvents: isDraggable ? "auto" : "none" ,
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
            width: `${shipWidth}px`, //xslobok: мне пришлось коечто поменять по что что изза этого были баги с размещением
            height: `${shipHeight}px`,
            borderRadius: "5px",
            border: "3px solid transparent", 
            boxSizing: "border-box",
            backgroundColor: "var(--ship-bg)",
            outline: isHovered ? "1px solid var(--ship-border)" : "none",
            outlineOffset: "-3px",
            
          }}
        ></div>
      </div>
    );
  }
}

export default Battleship;
