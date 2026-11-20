# API DOCS

## File `server.js`:

@brief Starts the HTTP and Socket.IO server, configures middleware and mounts HTTP routers.

The server listens on `127.0.0.1`, using `PORT` from the environment or `3000`.

Run `npm ci`, then `npm run dev` or `npm start` from `server/`.
Users and games are stored in memory and disappear on server restart.

## HTTP routers

`routes/userRoutes.js` exports `createUserRouter()` for user creation and statistics.
`routes/gameRoutes.js` exports `createGameRouter(io)` for creation, joining,
readiness, shots and reading a player's game state.

@param `io` The Socket.IO server created in `server.js`. The game router uses it
for state broadcasts.
@returns An Express Router with the corresponding HTTP handlers.

The server mounts both routers under `/api`:

```js
app.use("/api", createUserRouter());
app.use("/api", createGameRouter(io));
app.use(errorHandler);
```

Router paths omit this shared prefix. For example, the game router's
`/games/:gameId/ready` is available at `/api/games/:gameId/ready`.
The public ping and development fleet handlers are in `server.js`. CORS and body parsers run before the routers,
and the error handler runs after them.

## Player identity

Game requests send the guest's ID in the `userId` header:

```http
userId: alice
```

Game and statistics routes read this header directly. The frontend stores the
guest in App state. Reloading or signing out creates a new guest; the old user
and games remain in server memory.

# Game routes

## HTTP `POST /api/createUser`:

@param No body is required. The server generates the guest's UUID and name.
@returns HTTP 200 with `{id, name}`, where `name` is `"Guest"`.
If a generated UUID is already stored, the server generates another one.

```json
{"id": "cba9b04d-f6ac-4185-9fa0-3740439b53b8", "name": "Guest"}
```

App saves the returned `id` in React state and passes it to game requests.
Concurrent startup calls share the guest creation request in `user.js`.

## HTTP `POST /api/createGames`:

@param No body is required. The creator is taken from the `userId` header.
@returns HTTP 200 with the [player view](games.md), including `players.you`
and `players.opponent`. Initially, `opponent` is `null`.
App keeps this game view while navigating between routes.

## HTTP `POST /api/games/:gameId/join`:

@param `gameId` Game code in the URL. No body is required.
@returns HTTP 200 with the joining player's view.

## HTTP `POST /api/games/:gameId/ready`:

@param `gameId` Game code in the URL.
@param `board` A 10 by 10 matrix of ship labels or `null` in the JSON body.
@returns HTTP 200 with the player's view. Invalid fleet data returns HTTP 400
with `INVALID_FLEET`.

Convert the frontend board and send it like this:

```js
const board = boardData.map(row =>
    row.map(cell => cell.hasShip ? cell.shipId : null)
);

const response = await fetch(`/api/games/${gameId}/ready`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        userId
    },
    body: JSON.stringify({board})
});
const data = await response.json();
if (!response.ok) {
    console.log(data.error.code, data.error.message);
}
```

## HTTP `POST /api/games/:gameId/unready`:

@param `gameId` Game code in the URL. No body is required.
@returns HTTP 200 with the player's view. The stored fleet remains available
until replaced by another Ready request.

## HTTP `POST /api/games/:gameId/shots`:

@param `gameId` Game code in the URL.
@param `row`, `col` Integer coordinates from 0 to 9 in the JSON body.
@returns HTTP 200 with the [shot result](battle.md), rather than a full player view.

```json
{"row": 0, "col": 0}
```

## HTTP `POST /api/games/:gameId/gadgets/:gadget`:

@param `gadget` One of `radar`, `mine`, `relocate`.
@param JSON target coordinates, documented in [gadgets](gadgets.md).
@returns HTTP 200 with the requesting player's updated view. Successful actions
broadcast personal `game:state` views. Gadgets are one-use and require the player's turn.

Gadgets are applied through HTTP only. Socket.IO delivers personal `game:state`
updates after a successful action; see [gadget state updates](gadgets.md#socketio).

## HTTP `GET /api/games/:gameId`:

@param `gameId` Game code in the URL. No body or user query is required.
@returns HTTP 200 with the requesting player's view.

Creation, joining, Ready, Unready and GET all use the same state shape.
Successful game actions also send `game:state` to sockets subscribed to that
game. Each socket receives the view for its user ID.
Errors use `{error: {code, message}}`; see [error codes and statuses](errors.md).
Ready, shots and gadgets require a request body. Missing bodies return
HTTP 400 with `INVALID_REQUEST_BODY`.

## Other handlers

## HTTP `GET /api/statistics`:

@brief Computes statistics from completed games for the requesting player.
Only that player's finished games are included. Results are derived from the
in-memory game state and are lost when the server restarts.

@param `userId` Required request header containing an existing guest ID.
@param `offset` Query parameter, number of matches to skip. Defaults to `0`;
must be a non-negative integer.
@param `limit` Query parameter, number of matches to return. Defaults to `10`;
must be an integer from 1 to 100.
@returns HTTP 200 with totals for all completed games and a window of matches
in newest-first order. `moves` is the player's number of shots in that game.
Missing or unknown user IDs and invalid pagination return a structured error.

Request example:

```http
GET /api/statistics?offset=0&limit=10
userId: alice
```

Response shape:

```json
{
  "battlesWon": 1,
  "battlesLost": 0,
  "battlesPlayed": 1,
  "winRate": 100,
  "recentMatches": [
    { "date": "2026-11-15T16:00:00.000Z", "result": "victory", "moves": 20 }
  ]
}
```

`winRate` is a rounded percentage from 0 to 100, or 0 when there are no
completed matches. Match dates are ISO 8601 timestamps; `result` is `"victory"`
or `"defeat"`. Totals always cover all of the player's completed matches,
regardless of the requested page. An offset at or beyond the end returns an
empty `recentMatches` array.

___
## HTTP `POST /api/dev/fleet`:

@param `board` Matrix from `req.body.board`, passed to `prepareFleet`.
@returns Prepared fleet in the response shown below.
___
## HTTP `GET /api/ping`:

@returns `{message: "pong"}`.
___
# Socket.IO:

@brief `socketHandlers.js` is registered in `server.js`. Connections supply
`auth: {userId}`. Send `game:subscribe` with `{gameId}` to receive the initial
`game:state` and later updates after successful HTTP game actions.

See [Socket.IO subscriptions](socket.md) for callback results, errors and the
frontend subscription example. The frontend disables automatic reconnection.
___
Successful response from `POST /api/dev/fleet`:

```js
{
  valid: true,
  fleet: [ /* Ship objects from prepareFleet. */ ]
}
```

This development route prepares a fleet without saving it in a game or marking
a player ready. It reads only `board` from the body.

If `prepareFleet` rejects the board, the route returns HTTP 400 with
`{error: message}` before accessing any ship cells for debug logging.
