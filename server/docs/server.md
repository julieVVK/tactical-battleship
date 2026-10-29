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

The game routes read this header directly. Statistics does not require a user ID.
The frontend stores the guest in App state. Reloading or signing out creates a
new guest; the old user and games remain in server memory.

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

## HTTP `GET /api/games/:gameId`:

@param `gameId` Game code in the URL. No body or user query is required.
@returns HTTP 200 with the requesting player's view.

Creation, joining, Ready, Unready and GET all use the same state shape.
Successful game actions also send `game:state` to sockets subscribed to that
game. Each socket receives the view for its user ID.
Errors use `{error: {code, message}}`; see [error codes and statuses](errors.md).
User creation, Ready and shots require a request body. Missing bodies return
HTTP 400 with `INVALID_REQUEST_BODY`.

## Other handlers

## HTTP `GET /api/statistics`:

@brief Returns sample statistics and a requested window of match history.
`statistics.js` exports the `statistics` constant with fixed totals and 60
sample matches. The first ten match the statistics page design; the
remaining fifty are generated sample history. Every caller receives
the same response for the same query. Game actions do not update this data.

@param No body or user ID is required.
@param `offset` Query parameter, number of matches to skip. Defaults to `0`.
The frontend supplies a non-negative integer.
@param `limit` Query parameter, number of matches to return, a positive integer.
Defaults to `10`.
@returns HTTP 200 with totals for the full history, a window of matches in newest
first order. The route assumes valid pagination parameters from the frontend.

Default response from `GET /api/statistics`:

```json
{
  "battlesWon": 48,
  "battlesLost": 12,
  "battlesPlayed": 60,
  "winRate": 80,
  "recentMatches": [
    { "date": "2026-09-21T18:42:00+02:00", "result": "victory", "moves": 42 },
    { "date": "2026-09-21T17:15:00+02:00", "result": "victory", "moves": 38 },
    { "date": "2026-09-20T21:08:00+02:00", "result": "defeat", "moves": 51 },
    { "date": "2026-09-20T19:34:00+02:00", "result": "victory", "moves": 35 },
    { "date": "2026-09-19T22:10:00+02:00", "result": "victory", "moves": 46 },
    { "date": "2026-09-19T18:56:00+02:00", "result": "victory", "moves": 41 },
    { "date": "2026-09-18T20:22:00+02:00", "result": "defeat", "moves": 49 },
    { "date": "2026-09-18T16:40:00+02:00", "result": "victory", "moves": 37 },
    { "date": "2026-09-17T21:03:00+02:00", "result": "victory", "moves": 44 },
    { "date": "2026-09-17T19:11:00+02:00", "result": "victory", "moves": 39 }
  ]
}
```

`winRate` is a percentage from 0 to 100. Match dates use ISO 8601 with a timezone
offset, and `result` is `"victory"` or `"defeat"`. `recentMatches` contains only
the requested window. Totals are fixed in the exported constant and stay the
same across windows: 48 wins, 12 losses and an 80% win rate.

Request examples:

```http
GET /api/statistics?offset=0&limit=10
GET /api/statistics?offset=10&limit=10
GET /api/statistics?offset=20&limit=10
```

The frontend chooses `limit` based on how many rows it wants to show. For a
"Load more" button, increase `offset` by the number of returned matches and
append the next response's matches. For page navigation, use `offset = (page - 1) * limit`
and replace the displayed rows.

The route returns up to `limit` matches. If six remain and ten are requested,
it returns six. An offset at or beyond the end returns an empty `recentMatches`
array with the same overall totals. There are no pagination metadata fields.
The frontend can check `offset + recentMatches.length < battlesPlayed` to
decide whether another window exists, including when the final window is full.

The frontend can use `winRate` and `100 - winRate` for the overall results bar
and its 80% / 20% labels. Reducing `battlesWon / battlesPlayed`, or 48 / 60,
gives the "4 out of 5" caption. Format match dates in `Europe/Prague` to display
the dates and times shown in the design.

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
