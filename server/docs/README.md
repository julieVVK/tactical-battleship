# API DOCS

Documentation is grouped by topic:

- [Fleet placement](placement.md), `placement.js`, board format and prepared ship cells.
- [Games and players](games.md), `games.js`, game structures, joining and readiness.
- [Shots and match results](battle.md), `games.js`, hits, sunk ships and victory.
- [Gadgets](gadgets.md), radar cells, reflected mine shots and ship relocation.
- [Error codes](errors.md), `games.js` codes, thrown exceptions and uncoded failures.
- [Users](users.md), `users.js`, user structure and functions.
- [Game rules](rules.md), `rules.js`, board dimensions and fleet sizes.
- [Network handlers](server.md), `server.js` and `routes/`, HTTP routes and Socket.IO events.
- [Socket.IO subscriptions](socket.md), personal state updates and subscriptions.
- [Insomnia collection](insomnia.json), 55 HTTP requests with userId headers and response checks.

Import `insomnia.json` and run the entire collection in its saved order.
The first Ping clears saved IDs. The following guest requests create users without
a request body and save the server-generated IDs. Game codes are saved automatically.
Game requests use the `userId` header. Run the backend from `server/` with `npm ci`, `npm run dev`
for development process, and `npm start` for production.
