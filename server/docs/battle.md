# API DOCS

## File `games.js`:

@brief Records a shot, marks an opponent's ship cell as hit and determines whether a ship or the entire fleet is destroyed.

Function:

```js
fireShot(gameId, userId, row, col)
```

Successful response structure for a miss:

```js
{
  row: 9,
  col: 9,
  result: "miss",
  playerId: "alice",
  opponentId: "bob",
  phase: "battle",
  turnPlayerId: "bob",
  winnerPlayerId: null
}
```

For a hit, `result` is `"hit"`. A hit keeps the shooter's turn.
When every cell of a ship has `hit: true`, the result is `"sunk"` and includes
all coordinates of that ship:

```js
{
  row: 2,
  col: 6,
  result: "sunk",
  cells: [
    { row: 2, col: 4 },
    { row: 2, col: 5 },
    { row: 2, col: 6 }
  ],
  playerId: "alice",
  opponentId: "bob",
  phase: "battle",
  turnPlayerId: "alice",
  winnerPlayerId: null
}
```

`cells` is included only for `"sunk"`. Its length is the size of the destroyed ship.
Ship objects do not store a separate `sunk` flag; destruction is computed from
their cells. A one-cell ship is sunk by its first hit.

After destruction of the entire opponent fleet, the final shot still has
`result: "sunk"`, with these match fields:

```js
{
  phase: "finished",
  turnPlayerId: null,
  winnerPlayerId: "alice"
}
```

Only the player whose turn it is can shoot. Repeated coordinates, invalid
coordinates and shots outside the battle phase throw [coded errors](errors.md).
A miss passes the turn; a hit or sunk ship keeps it until the match ends.

Each entry saved in `player.shots` contains `row`, `col`, `result` and, for
`"sunk"`, `cells`. Participant IDs and match fields are added to the response.

___
