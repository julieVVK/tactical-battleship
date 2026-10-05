// File was created by Vladyslav Doroshenko

import { getGameForPlayer } from "./games.js"


export default function publishGame(io, gameId) {
    // HTTP handlers call this only after the game action has succeeded.
    const normalizedGameId = gameId.trim().toUpperCase()

    for (const socket of io.sockets.sockets.values()) {
        if (socket.data.gameId !== normalizedGameId) continue

        const view = getGameForPlayer(normalizedGameId, socket.data.userId)
        socket.emit("game:state", view)
    }
}
