import { useEffect, useId, useRef, useState } from "react";
import "./chatPanel.css";


export default function ChatPanel({ chat, userId }) {
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState("");
  const inputId = useId();
  const messagesRef = useRef(null);

  useEffect(() => {
    const container = messagesRef.current;
    if (container) { container.scrollTop = container.scrollHeight; }
  }, [chat.messages]);

  const {messages, loading, sending, error, connected, sendMessage, editMessage, deleteMessage } = chat;
  const canSend = connected && !sending && draft.trim().length > 0;


  async function handleSubmit(event) {
    event.preventDefault();
    if (!canSend) return;
    const sent = await sendMessage(draft);

    if (sent) { setDraft(""); }  // keeping the draft if request failed
  }

  function startEditing(message) {
  setEditingId(message.id);
  setEditDraft(message.text);
}


function cancelEditing() {
  setEditingId(null);
  setEditDraft("");
}


async function handleSave(event, messageId) {
  event.preventDefault();

  if (!connected || sending || !editDraft.trim()) return;

  const saved = await editMessage(messageId, editDraft);

  if (saved) { cancelEditing(); }
}


function startEditing(message) {
  setEditingId(message.id);
  setEditDraft(message.text);
}


function cancelEditing() {
  setEditingId(null);
  setEditDraft("");
}


async function handleSave(event, messageId) {
  event.preventDefault();

  if (!connected || sending || !editDraft.trim()) return;

  const saved = await editMessage(messageId, editDraft);

  if (saved) { cancelEditing(); }
}


async function handleDelete(messageId) {
  if (!connected || sending) return;

  const deleted = await deleteMessage(messageId);

  if (deleted && editingId === messageId) {
    cancelEditing();
  }
}


  return (
    <aside className="chat-panel" aria-label="Game chat">
      <header className="chat-panel__header">
        <h2>Game chat</h2>
      </header>

      <div
        ref={messagesRef}
        className="chat-panel__messages"
        role="log"
        aria-label="Messages"
        aria-live="polite"
        aria-relevant="additions text"
      >
        {loading && <p>Loading messages…</p>}
        {connected && !loading && messages.length === 0 && (
          <p className="chat-panel__empty">
            No messages yet - say ahoj!
          </p>
        )}

        {messages.map((message) => {
          const isOwn = message.authorId === userId;

          return (
            <article
              key={message.id}
              className={ isOwn ? "chat-panel__message chat-panel__message--own" : "chat-panel__message" } >
              <div className="chat-panel__meta">
                <strong>{isOwn ? "You" : "Opponent"}</strong>

                <time dateTime={message.createdAt}>
                  {new Date(message.createdAt).toLocaleTimeString(
                    [],
                    { hour: "2-digit", minute: "2-digit" }
                  )}
                </time>
              </div>

              {editingId === message.id && !message.deletedAt ? (
                <form
                  className="chat-panel__edit-form"
                  onSubmit={(event) => handleSave(event, message.id)}
                >
                  <label>
                    Edit message

                    <textarea
                      value={editDraft}
                      onChange={(event) => setEditDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.nativeEvent.isComposing) return;

                        if (event.key === "Escape" && !sending) {
                          event.preventDefault();
                          cancelEditing();
                        }

                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();

                          if (connected && !sending && editDraft.trim()) {
                            event.currentTarget.form?.requestSubmit();
                          }
                        }
                      }}
                      maxLength={500}
                      rows={3}
                      disabled={sending}
                      autoFocus
                    />
                  </label>

                  <div className="chat-panel__message-actions">
                    <button
                      type="submit"
                      disabled={!connected || sending || !editDraft.trim()}
                    >
                      Save
                    </button>

                    <button
                      type="button"
                      onClick={cancelEditing}
                      disabled={sending}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <p className="chat-panel__text">
                  {message.deletedAt ? "Message deleted" : message.text}
                </p>
              )}

              {message.editedAt && !message.deletedAt && (
                <small>Edited</small>
              )}

              {isOwn && !message.deletedAt && editingId !== message.id && (
                <div className="chat-panel__message-actions">
                  <button
                    type="button"
                    onClick={() => startEditing(message)}
                    disabled={!connected || sending}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(message.id)}
                    disabled={!connected || sending}
                  >
                    Delete
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {error && (
        <p className="chat-panel__error" role="alert">
          {error}
        </p>
      )}

      <form
        className="chat-panel__form"
        onSubmit={handleSubmit}
      >
        <label htmlFor={inputId}>Your message</label>

        <textarea
        id={inputId}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
            if (
            event.key === "Enter" &&
            !event.shiftKey &&
            !event.nativeEvent.isComposing
            ) {
            event.preventDefault();

            if (canSend) {
                event.currentTarget.form?.requestSubmit();
            }
            }
        }}
        maxLength={500}
        rows={3}
        disabled={sending}
        placeholder="Write a message…"
        />

        <div className="chat-panel__actions">
          <small>{draft.length}/500</small>

          <button type="submit" disabled={!canSend}>
            {sending ? "Sending…" : "Send"}
          </button>
        </div>
      </form>
    </aside>
  );
}