// File was created by Vladyslav Doroshenko

import { useRef, useState } from "react";
import { createLobby, joinLobby } from "../../api/lobby.js";
import Ship from "../ship/Ship.jsx";
import ProfileMenu from "../profileMenu/ProfileMenu.jsx";
import Button from "../button/Button.jsx";
import DialogWindow from "../dialogWindow/DialogWindow.jsx";
import "./mainPage.css";


const dialogTitles = {
    play: "Play",
    lobby: "Lobby",
    join: "Join a lobby",
    create: "Create a lobby",
};


function MainPage({
    onNavigateSettings, onNavigateRules, onStartGame, onResumeGame,
    game, isRestoring, gameError, canRestore, onRestoreGame, connection,
}) {
    const [dialogView, setDialogView] = useState(game?.phase === "waiting" ? "create" : "play");
    const [lobbyInput, setLobbyInput] = useState("");
    const [copyStatus, setCopyStatus] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lobbyError, setLobbyError] = useState("");
    const requestPending = useRef(false);
    const busy = isSubmitting || isRestoring;
    const errorMessage = lobbyError || gameError || connection.error;
    const currentView = dialogView === "create" && !game ? "lobby" : dialogView;

    async function handleCreateLobby() {
        if (requestPending.current || isRestoring) return;
        setLobbyError("");
        setCopyStatus("");

        if (game?.phase === "waiting") {
            setDialogView("create");
            return;
        }

        requestPending.current = true;
        setIsSubmitting(true);
        try {
            const createdGame = await createLobby();
            onStartGame(createdGame);
        } catch (error) {
            setLobbyError(error.message);
        } finally {
            requestPending.current = false;
            setIsSubmitting(false);
        }
    }


    async function handleJoinLobby(event) {
        event.preventDefault();
        if (requestPending.current || isRestoring) return;

        requestPending.current = true;
        setIsSubmitting(true);
        setLobbyError("");
        try {
            const joinedGame = await joinLobby(lobbyInput);
            onStartGame(joinedGame);
        } catch (error) {
            setLobbyError(error.message);
        } finally {
            requestPending.current = false;
            setIsSubmitting(false);
        }
    }


    async function copyLobbyCode() {
        try {
            await navigator.clipboard.writeText(game.id);
            setCopyStatus("Copied!");
        } catch {
            setCopyStatus("Couldn't copy. Select and copy the code above.");
        }
    }


    function goBack() {
        setDialogView(currentView === "lobby" ? "play" : "lobby");
        setCopyStatus("");
        setLobbyError("");
    }


    return (
        <>
            <div className="main-page">
                <Ship />
                <ProfileMenu />
                <div className="main-page-content">
                    <h1 className="main-page-title">Battleships</h1>
                    <DialogWindow
                        title={dialogTitles[currentView]}
                        className={currentView === "lobby" ? "main-page-lobby-dialog" : ""}
                    >
                        {currentView === "play" && (
                            <div className="main-page-button-container">
                                <Button variant="light" disabled={busy}>With PC</Button>
                                <Button variant="dark" disabled={busy} onClick={() => setDialogView("lobby")}>2 Players</Button>
                            </div>
                        )}

                        {currentView === "lobby" && (
                            <div className="main-page-lobby-actions">
                                <Button variant="light" disabled={busy} onClick={() => {
                                    setLobbyError("");
                                    setDialogView("join");
                                }}>Join</Button>
                                <Button variant="dark" disabled={busy} onClick={handleCreateLobby}>
                                    {isSubmitting ? "Creating..." : game?.phase === "waiting" ? "Return to lobby" : "Create"}
                                </Button>
                            </div>
                        )}

                        {currentView === "join" && (
                            <form className="main-page-lobby-fields" onSubmit={handleJoinLobby}>
                                <div className="main-page-lobby-field">
                                    <label htmlFor="lobby-invitation">Lobby code or invitation link</label>
                                    <input
                                        id="lobby-invitation"
                                        className="main-page-lobby-input"
                                        placeholder="ABC123 or paste a lobby link"
                                        value={lobbyInput}
                                        disabled={busy}
                                        onChange={(event) => setLobbyInput(event.target.value)}
                                        aria-describedby={errorMessage ? "lobby-error" : undefined}
                                    />
                                </div>
                                <Button variant="dark" type="submit" disabled={busy || !lobbyInput.trim()}>
                                    {isSubmitting ? "Joining..." : "Join lobby"}
                                </Button>
                            </form>
                        )}

                        {currentView === "create" && (
                            <div className="main-page-lobby-fields">
                                <div className="main-page-lobby-field">
                                    <label htmlFor="created-lobby-code">Your lobby code</label>
                                    <input
                                        id="created-lobby-code"
                                        className="main-page-lobby-input main-page-lobby-code"
                                        value={game?.id || ""}
                                        readOnly
                                    />
                                </div>
                                <Button variant="dark" onClick={copyLobbyCode}>Copy code</Button>
                                {copyStatus && <p className="main-page-lobby-hint" role="status">{copyStatus}</p>}
                                <p className="main-page-lobby-waiting">Waiting for another player...</p>
                                <p className="main-page-lobby-hint">Back keeps this lobby open.</p>
                            </div>
                        )}
                        {isRestoring && <p role="status">Restoring your lobby...</p>}
                        {game && game.phase !== "waiting" && (
                            <Button variant="dark" disabled={busy} onClick={onResumeGame}>Resume game</Button>
                        )}
                        {errorMessage && <p id="lobby-error" className="main-page-lobby-hint" role="alert">{errorMessage}</p>}
                        {connection.error && <Button disabled={busy} onClick={connection.reconnect}>Reconnect</Button>}
                        {canRestore && !isRestoring && <Button disabled={busy} onClick={onRestoreGame}>Restore lobby</Button>}
                    </DialogWindow>

                    {currentView !== "play" && (
                        <Button className="main-page-back" variant="light" disabled={busy} onClick={goBack}>Back</Button>
                    )}

                    <div style={{ display: "flex", flexDirection: "row", gap: "0.5rem"}}>
                        <Button className="main-page-rules" disabled={busy} onClick={onNavigateRules}>Rules</Button>
                        <Button className="main-page-rules" variant="light" disabled={busy} onClick={onNavigateSettings}>Settings</Button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default MainPage
