// Ship appearance based on xhaziyh00's component.
export default function BattleShip({ size, vertical = false }) {
    let width = size;
    let height = 1;
    if (vertical) {
        width = 1;
        height = size;
    }

    return (
        <div
            className="ship-body"
            style={{
                width: `calc(var(--cell-size) * ${width})`,
                height: `calc(var(--cell-size) * ${height})`,
            }}
        />
    );
}
