// File was created by Yuliia Vovk

// Message storage and operations: create, read, edit, delete

import { randomUUID } from "node:crypto";   // generates a unique identifier for a new message

const MAX_MESSAGE_LENGTH = 500;

// each game has its own array of messages --   gameId -> [message, message, ...]
// example: { "game1": [message1, message2], "game2": [message3] }
const messagesByGame = new Map();

// check the text and return its cleaned version.
function validateText(text) {
  if (typeof text !== "string") { throw new Error("Message text must be a string."); }
  const cleanedText = text.trim();
  if (cleanedText.length === 0) { throw new Error("Message cannot be empty."); }
  if (cleanedText.length > MAX_MESSAGE_LENGTH) {
    throw new Error(`Message cannot exceed ${MAX_MESSAGE_LENGTH} characters.`); }

  return cleanedText;   // no whitespace at the beginning or end, and not empty OR too long
}


// find the actual stored message.
// this helper is private
function findMessage(gameId, messageId) {
  const messages = messagesByGame.get(gameId);  // RET UNDEFINED if the gameId is not found (.get)
  if (!messages) { throw new Error("Message not found."); }
  const message = messages.find( (message) =>
     message.id === messageId );   // callback function to find the message with the given messageId
  if (!message) { throw new Error("Message not found."); }

  return message;
}
// returns the actual stored object
 

// return COPIES of all messages belonging to one game.
export function getMessages(gameId) {
  const messages = messagesByGame.get(gameId) ?? [];    // use this game’s messages. If none exist, use an empty array
  return messages.map((message) => ({ ...message }));   // creates a new array containing a copy of every message
}


// create and store a new message
export function addMessage(gameId, authorId, text) {
  if (typeof gameId !== "string" || gameId.trim() === "") { throw new Error("Game ID is required."); }
  if (typeof authorId !== "string" || authorId.trim() === "") { throw new Error("Author ID is required."); }

  const cleanedText = validateText(text);
  const message = {
    id: randomUUID(),
    gameId,
    authorId,
    text: cleanedText,
    createdAt: new Date().toISOString(),    // "2026-11-19T15:00:00.000Z"
    editedAt: null,
    deletedAt: null,
    version: 1
  };

  let messages = messagesByGame.get(gameId);    // let cause we may need to create a new array for this game
  if (!messages) {
    messages = [];
    messagesByGame.set(gameId, messages); }
  messages.push(message);       // ADD DATA TO MODEL

  return { ...message };    // ret copyed object with the new message’s data
}


// update the text of an existing message
export function editMessage(gameId, messageId, userId, newText) {
  const message = findMessage(gameId, messageId);

  if (message.authorId !== userId) { throw new Error("You can edit only your own messages."); }
  if (message.deletedAt !== null) { throw new Error("A deleted message cannot be edited."); }

  const cleanedText = validateText(newText);

  // no change is needed if the text is identical.
  if (message.text === cleanedText) { return { ...message }; }
  message.text = cleanedText;
  message.editedAt = new Date().toISOString();
  message.version = (message.version ?? 1) + 1;

  return { ...message };
}


// mark a message as deleted and remove its text
export function deleteMessage(gameId, messageId, userId) {
  const message = findMessage(gameId, messageId);
  if (message.authorId !== userId) { throw new Error("You can delete only your own messages."); }
  // repeating a deletion does not change the result.
  if (message.deletedAt !== null) { return { ...message }; }
  message.text = "";
  message.deletedAt = new Date().toISOString();
  message.version = (message.version ?? 1) + 1;

  return { ...message };
}