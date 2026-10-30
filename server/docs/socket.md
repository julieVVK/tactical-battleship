# Socket.IO

@brief Sends each subscribed player their own game state. Game actions use HTTP.

## Player identity

Use the guest ID returned by `POST /api/createUser` in the Socket.IO `auth` object:

```js
import { io } from "socket.io-client";

const socket = io("http://127.0.0.1:3000", {
    auth: { userId },
    autoConnect: false,
    reconnection: false
});
```

Install `socket.io-client` in the frontend project before importing it.
The explicit backend URL also works when Vite proxies only `/api`.

`socketHandlers.js` copies `socket.handshake.auth.userId` to `socket.data.userId`.
Game membership is checked when subscribing.

## Subscribe to a game

Event `game:subscribe`, client to server:

@param `payload` Object containing `{gameId}`.
@param `acknowledge` Optional callback receiving the subscription result.
@returns `{ok: true, gameId}` on success, using the normalized uppercase code.
@emits `game:state` Immediately after a successful subscription.

The server checks game membership using `socket.data.userId`.
Each socket has one game subscription. A successful new subscription replaces
the old one. A rejected subscription preserves the previous subscription.
Different tabs can independently subscribe using the same user ID.

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

Use a `connect` handler to subscribe. Register the state listener once, outside
that handler:

```js
// App supplies the current guest ID and game ID.
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

The immediate snapshot after subscribing contains the latest state.
The server does not replay earlier events. The frontend disables automatic
reconnection and displays an error after a connection loss.
A full page reload or Sign out creates a new guest and does not restore the old game.

## Source and verification

`socketHandlers.js` registers connection and subscription handlers.
`gameEvents.js` reads each subscriber's filtered state and emits it.
`routes/gameRoutes.js` calls `publishGame(io, gameId)` after successful game actions.
`server.js` creates `io` and passes it into the HTTP router factories.
`games.js` remains responsible for stored games and state filtering.

From `server/`, run `npm test` to exercise real HTTP and Socket.IO clients against
an isolated server on a free port. The tests include a complete battle,
membership errors, separate games, multiple tabs and reconnection.
Reconnection tests exercise the server with a client that enables it.
The current suite is in `server/test/`. Older ignored files in `server/tests/`
use previous fleet and response formats and are outside the current test command.
