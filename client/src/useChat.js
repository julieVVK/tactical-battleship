import { useEffect, useRef, useState } from "react";
import { getChatMessages, sendChatMessage, editChatMessage, deleteChatMessage } from "./api.js";

// combine lists without displaying the same message twice
// used here for newly created messages
// keep one copy of each message, using its newest version
function mergeMessages(current, incoming) {
  const byId = new Map();

  for (const message of [...current, ...incoming]) {
    const stored = byId.get(message.id);

    if (
      !stored ||
      (message.version ?? 1) >= (stored.version ?? 1)
    ) {
      byId.set(message.id, message);
    }
  }

  return Array.from(byId.values()).sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt)
  );
}


export function useChat(gameId, userId, connection) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // Identifies the currently active chat session.
  const activeSession = useRef(null);

  const connected = Boolean(connection && connection.gameId === gameId && connection.userId === userId );


  useEffect(() => {
    setMessages([]);
    setError("");
    setLoading(false);
    setSending(false);

    if (!connected) return;
    const socket = connection.socket;
    const session = { active: true, sending: false };
    activeSession.current = session;

    function handleMessage(message) {
      if (!session.active || message.gameId !== gameId) { return; }
      setMessages((current) =>
        mergeMessages(current, [message])
      );
    }

    // start listening before requesting history
    socket.on("chat:message", handleMessage);

    async function loadHistory() {
      setLoading(true);

      try {
        const history = await getChatMessages(gameId, userId);
        if (!session.active) return;

        // preserve messages received while HTTP was loading
        setMessages((current) =>
          mergeMessages(history, current)
        );
      } catch (error) {
        if (session.active) { setError(error.message); }
      } finally {
        if (session.active) { setLoading(false); }
      }
    }

    loadHistory();

    return () => {
      session.active = false;
      socket.off("chat:message", handleMessage);
      if (activeSession.current === session) { activeSession.current = null; }
    };
  }, [gameId, userId, connection, connected]);


  // Shared handling for sending, editing and deleting.
  async function performAction(action) {
    const session = activeSession.current;

    if ( !connected || !connection.socket.connected || !session?.active || session.sending ) {
      return false;
    }

    session.sending = true;
    setSending(true);
    setError("");

    try {
      const message = await action();
      if (!session.active) return false;

      setMessages((current) =>
        mergeMessages(current, [message])
      );

      return true;
    } catch (error) {
      if (session.active) { setError(error.message); }
      return false;
    } finally {
      session.sending = false;

      if (session.active) { setSending(false); }
    }
  }


  function sendMessage(text) {
    return performAction(() =>
      sendChatMessage(gameId, userId, text)
    );
  }


  function editMessage(messageId, text) {
    return performAction(() =>
      editChatMessage(gameId, userId, messageId, text)
    );
  }


  function deleteMessage(messageId) {
    return performAction(() =>
      deleteChatMessage(gameId, userId, messageId)
    );
  }

  return {messages, loading, sending, error, connected, sendMessage, editMessage, deleteMessage};
}