# API DOCS

## File `games.js`:

@brief Stores games in memory and handles joining, readiness, shots and match results.

### Initial game structure:

```js
const game = {
  id: makeGameId(),
  phase: "waiting",
  players: [makePlayer(user)],
  turnPlayerId: null,
  winnerPlayerId: null
};
```

`makeGameId()` and `makePlayer(user)` are private helpers in this file.

@param `id` Unique six-character hexadecimal game code, for example `"A1B2C3"`.

@param `phase` `"waiting"`, `"placement"`, `"battle"` or `"finished"`.

@param `players` One player initially, two after joining.

@param `turnPlayerId` ID of the player who can shoot; `null` before battle and after completion.

@param `winnerPlayerId` Winner's user ID; `null` until the match is won.

### Player structure:

```js
{
  id: "alice",
  name: "Alice",
  ready: false,
  ships: [],
  shots: []
}
```

`ships` stores that player's own fleet in the format returned by `prepareFleet`.
`shots` stores that player's outgoing shots at the opponent's board, including misses.
___
## Functions:
Function `createGame(userId)`:
@param `userId` ID of an existing user.

@returns Copy of the full initial internal game.

The HTTP creation route returns `getGameForPlayer(game.id, userId)` instead,
so clients receive the same player view as after joining or reading the game.
___

Function `joinGame(gameId, userId)`:

@param `gameId` Game code.

@param `userId` ID of an existing user.

@returns Updated player view.
___

Function `readyPlayer(gameId, userId, board)`:

@param `gameId` Game ID.

@param `userId` Participant ID.

@param `board` Board matrix.

@returns Updated player view. Invalid fleet data throws `INVALID_FLEET`.
___

Function `unreadyPlayer(gameId, userId)`:

@param `gameId` Game ID.

@param `userId` Participant ID.

@returns Updated player view.
___

Function `fireShot(gameId, userId, row, col)`:

@param `gameId` Game ID.

@param `userId` Shooter ID.

@param `row` Opponent-board row index.

@param `col` Opponent-board column index.

@returns Shot result.
___

Function `getGame(gameId)`:

@param `gameId` Game ID.

@returns Copy of the full internal game, including both fleets.
___

Function `getGames()`:

@returns Array of all games, including finished games. No arguments are required.
___

Function `getGameForPlayer(gameId, userId)`:

@param `gameId` Game code.

@param `userId` Participant ID.

@returns Player view. The opponent's fleet is omitted.

```js
{
  id: "A1B2C3",
  phase: "waiting",
  players: {
    you: { id: "alice", name: "Alice", ready: false, ships: [], shots: [] },
    opponent: null
  },
  turnPlayerId: null,
  winnerPlayerId: null
}
```

After joining, `opponent` contains `id`, `name`, `ready` and outgoing `shots`,
but no `ships`. HTTP creation, joining, readiness, cancelling readiness and
GET state all return this structure. The shots route returns a shot result.

All game functions throw coded errors on failure, documented in [errors](errors.md).
Ready receives the board matrix:

```js
readyPlayer(gameId, userId, payload.board);
```

Every function receiving a game code checks that it contains six hexadecimal
characters after trimming spaces, then converts it to uppercase. Invalid codes
throw `INVALID_GAME_ID`; valid codes for absent games throw `GAME_NOT_FOUND`.

Both ready players start the battle. The first player is selected randomly.
Readiness can be cancelled before battle, and the previous fleet remains until
another valid submission replaces it.

Game functions return deep copies of the stored game or shot result.
Changes to returned objects do not change the stored match.

___
