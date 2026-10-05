# Socket.IO

@brief Sends each subscribed player their own game state. Game actions use HTTP.

## Authentication

Use the token from `POST /api/createUser` in the Socket.IO `auth` object:

```js
import { io } from "socket.io-client";

const socket = io("http://127.0.0.1:3000", {
    auth: { token },
    autoConnect: false
});
```

Install `socket.io-client` in the frontend project before importing it.
The explicit backend URL also works when Vite proxies only `/api`.

`socketMiddleware.js` checks the session before allowing the connection.
It saves `userId` and `sessionToken` in `socket.data`.
Missing or unknown tokens produce `connect_error` with
`error.data = {code: "SESSION_NOT_FOUND", message: "..."}`.
Transport connection failures may have no `error.data`.

## Subscribe to a game

Event `game:subscribe`, client to server:

@param `payload` Object containing `{gameId}`.
@param `acknowledge` Optional callback receiving the subscription result.
@returns `{ok: true, gameId}` on success, using the normalized uppercase code.
@emits `game:state` Immediately after a successful subscription.

The server checks game membership using the session's user ID. A client cannot
subscribe to another player's view by supplying a `userId`.
Each socket has one game subscription. A successful new subscription replaces
the old one. A rejected subscription preserves the previous subscription.
Different tabs can independently subscribe using the same token.

On failure the callback receives:

```json
{"ok": false, "error": {"code": "PLAYER_NOT_IN_GAME", "message": "..."}}
```

Without a callback the server instead emits `game:error` with `{code, message}`.
Other subscription errors include `INVALID_GAME_ID` and `GAME_NOT_FOUND`.

## Receive state and reconnect

Event `game:state`, server to client:

@param `view` The same [player view](games.md) as `GET /api/games/:gameId`.
@emits After subscription and successful Create, Join, Ready, Unready or shots.

Each recipient gets their own `players.you` and `players.opponent`.
The opponent's ships are omitted. Rejected HTTP actions do not broadcast state.
Subscribe after creating or joining a game. Creating a game does not subscribe
existing sockets automatically.

Use a `connect` handler to subscribe on both the initial connection and every
reconnection. Register the state listener once, outside that handler:

```js
// Read saved values after checking that they exist.
// const token = localStorage.getItem("token");
// const gameId = localStorage.getItem("gameId");
socket.on("game:state", view => {
    setGame(view);
});

socket.on("connect", () => {
    socket.timeout(5000).emit("game:subscribe", { gameId }, (error, result) => {
        if (error) {
            console.log("Subscription timed out", error.message);
            return;
        }
        if (!result.ok) {
            console.log(result.error.code, result.error.message);
        }
    });
});

socket.on("connect_error", error => {
    console.log(error.data?.code, error.message);
});

socket.connect();

// When disposing this connection, for example when leaving the game page:
// socket.disconnect();
```

The immediate snapshot after subscribing contains changes missed while offline.
The server does not replay earlier events. A page reload needs the saved token
and game code to open a new connection and subscribe again.
Socket.IO handles temporary transport disconnections automatically.
See the [official client API](https://socket.io/docs/v4/client-api/) for `connect`,
`connect_error` and acknowledgement timeouts.

`GET /api/signout` disconnects every socket using the removed session token.
This server disconnect does not automatically reconnect. A new valid session
is required before reconnecting.

## Source and verification

`socketHandlers.js` registers authentication and subscription handlers.
`gameEvents.js` reads each subscriber's filtered state and emits it.
`routes/gameRoutes.js` calls `publishGame(io, gameId)` after successful game actions.
`server.js` creates `io` and passes it into the HTTP router factories.
`games.js` remains responsible for stored games and state filtering.

From `server/`, run `npm test` to exercise real HTTP and Socket.IO clients against
an isolated server on a free port. The tests include a complete battle,
membership errors, separate games, multiple tabs, reconnection and signout.
The current suite is in `server/test/`. Older ignored files in `server/tests/`
use previous fleet and response formats and are outside the current test command.
