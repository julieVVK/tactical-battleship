# API DOCS

Documentation is grouped by topic:

- [Fleet placement](placement.md), `placement.js`, board format and prepared ship cells.
- [Games and players](games.md), `games.js`, game structures, joining and readiness.
- [Shots and match results](battle.md), `games.js`, hits, sunk ships and victory.
- [Error codes](errors.md), `games.js` codes, thrown exceptions and uncoded failures.
- [Users](users.md), `users.js`, user structure and functions.
- [Sessions](sessions.md), token storage, HTTP middleware and signout.
- [Game rules](rules.md), `rules.js`, board dimensions and fleet sizes.
- [Network handlers](server.md), `server.js` and `routes/`, HTTP routes and Socket.IO events.
- [Socket.IO subscriptions](socket.md), personal state updates and frontend reconnection.
- [Insomnia collection](insomnia.json), 60 HTTP requests with token storage and response checks.

Import `insomnia.json` and run the entire collection in its saved order.
The first Ping creates fresh user IDs for each iteration. Tokens and game codes
are saved automatically. Run the backend from `server/` with `npm ci`, `npm run dev`
for development process, and `npm start` for production.
