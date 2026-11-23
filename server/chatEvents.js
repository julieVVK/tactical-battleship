// File was created by Yuliia Vovk


/*
When a player sends a message, the controller will:
1. Read the game ID from the URL.
2. Obtain the current player’s identity.
3. Verify that the player belongs to this game.
4. Read text from the request body.
5. Call addMessage.
6. Return the created message and notify both players.
*/

// module for sending chat messages to all clients in a game.
// used by socketHandlers.js when a new message is added.

import { getGameForPlayer } from "./games.js";

export default function publishChatMessage(io, message) {
  const gameId = message.gameId;

  for (const socket of io.sockets.sockets.values()) {
    // Ignore clients subscribed to a different game.
    if (socket.data.gameId !== gameId) {
      continue;
    }

    // client still belongs to the game?
    try {
      getGameForPlayer(gameId, socket.data.userId);
    } 
    catch {
      continue;
    }
    socket.emit("chat:message", message);
  }
}