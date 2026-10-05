# Error codes

`fail(code, message)` in `error.js` creates an `Error`, sets `error.code` and
throws it. The HTTP routes use the shared `errorHandler.js` to return:

```json
{
  "error": {
    "code": "GAME_NOT_FOUND",
    "message": "Game not found."
  }
}
```

Use `response.ok` and `error.code` to handle errors on the frontend.
`error.message` contains an explanation and may differ between functions.

## HTTP 400

- `INVALID_USER_ID`: the new user's ID is not a nonempty string.
- `INVALID_USER_NAME`: the new user's name is not a nonempty string.
- `INVALID_REQUEST_BODY`: user creation, Ready or shots received no request body.
- `INVALID_GAME_ID`: the game code is not a string of six hexadecimal characters
  after trimming surrounding spaces. Applies to every game-code lookup.
- `INVALID_FLEET`: Ready received a matrix rejected by `prepareFleet`.
- `INVALID_SHOT_COORDINATES`: row or col is not an integer from 0 to 9.
- `INVALID_JSON`: the JSON parser could not read the request body.

## HTTP 401

- `SESSION_NOT_FOUND`: no valid Bearer token was provided, or the session is absent.

The response includes `WWW-Authenticate: Bearer`.

## HTTP 403

- `PLAYER_NOT_IN_GAME`: the requesting user is not a participant in the game.

## HTTP 404

- `USER_NOT_FOUND`: no user exists with the supplied user ID.
- `GAME_NOT_FOUND`: the code has a valid format, but there is no corresponding game.

## HTTP 409

- `USER_ALREADY_EXISTS`: the new user's ID is already taken.
- `PLAYER_ALREADY_JOINED`: the user already participates in the game.
- `GAME_JOIN_CLOSED`: the game phase is no longer `"waiting"`.
- `GAME_FULL`: a waiting game already contains two players.
- `PLAYER_ALREADY_READY`: cancel Ready before submitting another fleet.
- `SHIP_PLACEMENT_CLOSED`: the phase is neither `"waiting"` nor `"placement"`.
- `BATTLE_NOT_ACTIVE`: shots are allowed only during `"battle"`.
- `TURN_MISMATCH`: the requesting player does not currently have the turn.
- `SHOT_DUPLICATE`: the player has already fired at these coordinates.

## HTTP 413 and 500

- `PAYLOAD_TOO_LARGE`: HTTP 413 when the body exceeds the parser's size limit.
- `INTERNAL_ERROR`: HTTP 500 for unexpected exceptions. The original error is
  logged on the server; the client receives a generic message.

## Check order and internal calls

Only the first failed check produces an error. The session middleware runs
before protected route handlers. Within the game functions, phase and turn
checks may run before action-specific data checks.

`joinGame` checks duplicate membership before the phase and the phase before
player count. After the second player joins, the phase is `"placement"`, so a
third player gets `GAME_JOIN_CLOSED`. Under the current state transitions,
`GAME_FULL` cannot occur through the public game functions.

`prepareFleet` itself still returns `{error: "..."}` for invalid matrices.
`readyPlayer` converts that result into an `INVALID_FLEET` exception before
changing a player's ships or readiness. Duplicate-user creation also throws
rather than returning an error string.

Direct callers of the game and user modules can catch the exception:

```js
try {
    joinGame(gameId, userId);
} catch (error) {
    console.log(error.code, error.message);
}
```

`server.js` registers `app.use(errorHandler)` after all routes. If headers have
already been sent, the error handler calls `next(error)`. CORS middleware runs
before the body parsers so their error responses include CORS headers too.

This format applies to the user, game and signout HTTP routes. The development
fleet route is described separately in [network handlers](server.md).
Socket.IO uses the same `decodeError` mapping. A rejected connection delivers
`{code, message}` in `connect_error`'s `error.data`. A rejected `game:subscribe`
returns `{ok: false, error: {code, message}}` in its callback, or emits
`game:error` with `{code, message}` when no callback was supplied.
See [Socket.IO subscriptions](socket.md).
