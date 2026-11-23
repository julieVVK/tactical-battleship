// https://www.geeksforgeeks.org/web-tech/express-js-router-method-function/

// File was created by Yuliia Vovk

import { Router } from "express";
import { getGameForPlayer } from "../games.js";
import { getMessages, addMessage, editMessage, deleteMessage } from "../chat.js";
import publishChatMessage from "../chatEvents.js";


export default function createChatRouter(io) {
  const router = Router();
  // read the conversation
  router.get("/games/:gameId/messages", (req, res) => {
    const userId = req.get("userId");
    const view = getGameForPlayer(req.params.gameId, userId);
    const messages = getMessages(view.id);

    return res.status(200).json(messages);
  });


  // Store a message and notify subscribed players.
  router.post("/games/:gameId/messages", (req, res) => {
    const userId = req.get("userId");
    const view = getGameForPlayer(req.params.gameId, userId);
    const text = req.body?.text;

    let message;

    try {
      message = addMessage(view.id, userId, text);
    } 
    catch (error) {
      return res.status(400).json({ error: {code: "INVALID_CHAT_MESSAGE", message: error.message} });
    }
    publishChatMessage(io, message);

    return res.status(201).json(message); });


  router.patch("/games/:gameId/messages/:messageId", (req, res) => {
    const userId = req.get("userId");
    const view = getGameForPlayer(req.params.gameId, userId);

    let message;

    try {
      message = editMessage( view.id, req.params.messageId, userId, req.body?.text );
    } catch (error) {
      return res.status(400).json({
        error: {
          code: "CHAT_EDIT_FAILED",
          message: error.message
        }
      });
    }

    publishChatMessage(io, message);
    return res.status(200).json(message);
  });


  router.delete("/games/:gameId/messages/:messageId", (req, res) => {
    const userId = req.get("userId");
    const view = getGameForPlayer(req.params.gameId, userId);

    let message;

    try {
      message = deleteMessage( view.id, req.params.messageId, userId );
    } catch (error) {
      return res.status(400).json({
        error: {
          code: "CHAT_DELETE_FAILED",
          message: error.message
        }
      });
    }

    publishChatMessage(io, message);

    return res.status(200).json(message);
  });

  return router;
}