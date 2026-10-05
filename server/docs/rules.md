# API DOCS

## File `rules.js`:

@brief Defines board dimensions and the required fleet composition.

Structure:

```js
export const BOARD_SIZE = 10;
export const FLEET_SIZES = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];
```

The fleet contains ten ships and twenty cells. `FLEET_SIZES` is sorted in
descending order for comparison with the collected ship sizes.

___
