# API DOCS

## File `sessions.js`

@brief Stores sessions in a private Map, separate from users and games.

The key is a token and the value is `{userId}`. Tokens contain 64 hexadecimal
characters generated from 32 random bytes. One user may have several sessions.
Sessions disappear when the server restarts.

#### Function `createSession(userId)`:

@param `userId` ID of an existing user.
@returns `{token, userId}` after saving the new session.

A missing user throws `USER_NOT_FOUND`.

#### Function `getSession(token)`:

@param `token` Session token.
@returns Copy of `{userId}`.

A missing session throws `SESSION_NOT_FOUND`. Changing the returned object's
properties does not change the stored session.

#### Function `removeSession(token)`:

@param `token` Session token to remove.
@returns `true` after deleting the session.

A missing session throws `SESSION_NOT_FOUND`. The user and their other sessions
are preserved.

## File `sessionMiddleware.js`

#### Function `requireSession(req, res, next)`:

@brief Reads `Authorization: Bearer <token>` and checks the session.
@param `req` Express request.
@param `res` Express response.
@param `next` Function that continues to the route handler.

On success it sets `req.userId` and `req.sessionToken`, then calls `next()`.
Missing, malformed or unknown tokens throw `SESSION_NOT_FOUND`, returned by the
HTTP error handler as status 401.

## Signout

`GET /api/signout` first runs `requireSession`, then calls
`removeSession(req.sessionToken)`. It returns HTTP 200 with a success message.
The handler is registered in `routes/userRoutes.js`, mounted under `/api` by
`server.js`. The router receives `io` to disconnect the session's sockets.
Further protected requests with that token return HTTP 401. The frontend should
clear its saved token after a successful response.
The route also disconnects all Socket.IO connections authenticated with that
token. Connections using other session tokens remain available.

See [network handlers](server.md) for the request example.

## Frontend storage

The existing ProfileMenu reads the session token from `localStorage` under
`token`. After a successful user creation, the frontend should save
`localStorage.setItem("token", data.token)`. After creating or joining a game,
save its code with `localStorage.setItem("gameId", data.id)`.

ProfileMenu removes only `token` and `gameId`, then reloads the page after a
successful signout or HTTP 401 with `SESSION_NOT_FOUND`. A missing session means
the user is already signed out on the server. If the token is missing locally,
it clears the same values without sending a request. Other HTTP errors or
network failures keep the stored values and show an error. The signout button
is disabled while a request is in progress.

User creation and game subscription on the frontend still need to be connected
by the page implementation. Insomnia environment variables are separate from
browser localStorage.

## File `socketMiddleware.js`

#### Function `requireSocketSession(socket, next)`:

@brief Checks `socket.handshake.auth.token` before accepting the connection.
@param `socket` Socket.IO connection being authenticated.
@param `next` Callback continuing the connection or rejecting it with an error.

On success it sets `socket.data.userId` and `socket.data.sessionToken`.
On failure it passes an Error with `{code, message}` in `error.data` to `next`.
The client receives `connect_error`. See [Socket.IO subscriptions](socket.md).
