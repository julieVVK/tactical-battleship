# API DOCS

## File `placement.js`:

@brief Creates an array of ships and their cells from the board received from the frontend.

Function:

```js
prepareFleet(board)
```

Argument `board` is a 10 × 10 matrix. Each cell contains `null` for water or a
nonempty string identifying a ship. All cells of one ship use the same string.
Different ships use different strings.

The function receives the matrix itself, not the entire request object:

```js
const fleet = prepareFleet(payload.board);
```

It checks matrix dimensions, cell value types, ship count and ship sizes.
It groups cells by their ship label and sets every cell's `hit` to `false`.
Straight-line placement, continuity and spacing between ships are not checked.

Returned structure for a valid fleet:

```js
[
  { cells: [ [Object], [Object], [Object], [Object] ] },
  { cells: [ [Object], [Object], [Object] ] },
  { cells: [ [Object], [Object], [Object] ] },
  { cells: [ [Object], [Object] ] },
  { cells: [ [Object], [Object] ] },
  { cells: [ [Object], [Object] ] },
  { cells: [ [Object] ] },
  { cells: [ [Object] ] },
  { cells: [ [Object] ] },
  { cells: [ [Object] ] }
]
```

Each cell object has this structure:

```js
{ row: 0, col: 0, hit: false }
```

`row` and `col` are zero-based indices from `0` to `9`.
Ship labels are used for grouping and are not included in the returned ships.
Ship order follows the first appearance of each label during the board scan;
the array above shows the expected sizes, not a guaranteed return order.

For invalid data, the function returns:

```js
{ error: "fleet has invalid size" }
```

The message depends on which check failed. The input board is not changed.

___
