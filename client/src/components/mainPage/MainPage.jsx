// File was created by Vladyslav Doroshenko

import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
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


function MainPage({ onNavigateSettings, onNavigateRules, onStartGame }) {
    const [dialogView, setDialogView] = useState("play");
    const [lobbyInput, setLobbyInput] = useState("");
    const [copyStatus, setCopyStatus] = useState("");
    const [lobbyGame, setLobbyGame] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lobbyError, setLobbyError] = useState("");
    const requestPending = useRef(false);

    useEffect(() => {
        if (dialogView !== "create" || !lobbyGame?.id) return;

        const socket = io({
            auth: { token: localStorage.getItem("token") },
            autoConnect: false,
        });

        socket.on("connect", () => {
            setLobbyError("");
            socket.timeout(5000).emit("game:subscribe", { gameId: lobbyGame.id }, (error, reply) => {
                if (error || !reply?.ok) {
                    setLobbyError(reply?.error?.message || "Couldn't subscribe to the lobby. Try opening it again.");
                }
            });
        });

        socket.on("game:state", (game) => {
            setLobbyGame(game);
            if (game.phase === "placement" && game.players.opponent) {
                onStartGame(game);
            }
        });

        socket.on("connect_error", (error) => {
            if (error.data?.code === "SESSION_NOT_FOUND") {
                localStorage.removeItem("token");
                localStorage.removeItem("gameId");
                setLobbyGame(null);
                setDialogView("lobby");
                setLobbyError("Your session expired. Create or join a lobby again.");
            } else {
                setLobbyError("Couldn't connect to the lobby. Reconnecting...");
            }
        });

        socket.on("disconnect", (reason) => {
            if (reason === "io server disconnect") {
                localStorage.removeItem("token");
                localStorage.removeItem("gameId");
                setLobbyGame(null);
                setDialogView("lobby");
                setLobbyError("Your session ended. Create or join a lobby again.");
            } else {
                setLobbyError("Connection lost. Reconnecting...");
            }
        });

        socket.connect();
        return () => {
            socket.removeAllListeners();
            socket.disconnect();
        };
    }, [dialogView, lobbyGame?.id, onStartGame]);


    async function handleCreateLobby() {
        if (requestPending.current) return;
        setLobbyError("");
        setCopyStatus("");

        if (lobbyGame) {
            setDialogView("create");
            return;
        }

        requestPending.current = true;
        setIsSubmitting(true);
        try {
            const game = await createLobby();
            setLobbyGame(game);
            setDialogView("create");
        } catch (error) {
            setLobbyError(error.message);
        } finally {
            requestPending.current = false;
            setIsSubmitting(false);
        }
    }


    async function handleJoinLobby(event) {
        event.preventDefault();
        if (requestPending.current) return;

        requestPending.current = true;
        setIsSubmitting(true);
        setLobbyError("");
        try {
            const game = await joinLobby(lobbyInput);
            onStartGame(game);
        } catch (error) {
            setLobbyError(error.message);
        } finally {
            requestPending.current = false;
            setIsSubmitting(false);
        }
    }


    async function copyLobbyCode() {
        try {
            await navigator.clipboard.writeText(lobbyGame.id);
            setCopyStatus("Copied!");
        } catch {
            setCopyStatus("Couldn't copy. Select and copy the code above.");
        }
    }


    function goBack() {
        setDialogView(dialogView === "lobby" ? "play" : "lobby");
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
                        title={dialogTitles[dialogView]}
                        className={dialogView === "lobby" ? "main-page-lobby-dialog" : ""}
                    >
                        {dialogView === "play" && (
                            <div className="main-page-button-container">
                                <Button variant="light">With PC</Button>
                                <Button variant="dark" onClick={() => setDialogView("lobby")}>2 Players</Button>
                            </div>
                        )}

                        {dialogView === "lobby" && (
                            <div className="main-page-lobby-actions">
                                <Button variant="light" disabled={isSubmitting} onClick={() => {
                                    setLobbyError("");
                                    setDialogView("join");
                                }}>Join</Button>
                                <Button variant="dark" disabled={isSubmitting} onClick={handleCreateLobby}>
                                    {isSubmitting ? "Creating..." : "Create"}
                                </Button>
                            </div>
                        )}

                        {dialogView === "join" && (
                            <form className="main-page-lobby-fields" onSubmit={handleJoinLobby}>
                                <div className="main-page-lobby-field">
                                    <label htmlFor="lobby-invitation">Lobby code or invitation link</label>
                                    <input
                                        id="lobby-invitation"
                                        className="main-page-lobby-input"
                                        placeholder="ABC123 or paste a lobby link"
                                        value={lobbyInput}
                                        disabled={isSubmitting}
                                        onChange={(event) => setLobbyInput(event.target.value)}
                                        aria-describedby={lobbyError ? "lobby-error" : undefined}
                                    />
                                </div>
                                <Button variant="dark" type="submit" disabled={isSubmitting || !lobbyInput.trim()}>
                                    {isSubmitting ? "Joining..." : "Join lobby"}
                                </Button>
                            </form>
                        )}

                        {dialogView === "create" && (
                            <div className="main-page-lobby-fields">
                                <div className="main-page-lobby-field">
                                    <label htmlFor="created-lobby-code">Your lobby code</label>
                                    <input
                                        id="created-lobby-code"
                                        className="main-page-lobby-input main-page-lobby-code"
                                        value={lobbyGame?.id || ""}
                                        readOnly
                                    />
                                </div>
                                <Button variant="dark" onClick={copyLobbyCode}>Copy code</Button>
                                {copyStatus && <p className="main-page-lobby-hint" role="status">{copyStatus}</p>}
                                <p className="main-page-lobby-waiting">Waiting for another player...</p>
                            </div>
                        )}
                        {lobbyError && <p id="lobby-error" className="main-page-lobby-hint" role="alert">{lobbyError}</p>}
                    </DialogWindow>

                    {dialogView !== "play" && (
                        <Button className="main-page-back" variant="light" disabled={isSubmitting} onClick={goBack}>Back</Button>
                    )}

                    <div style={{ display: "flex", flexDirection: "row", gap: "0.5rem"}}>
                        <Button className="main-page-rules" disabled={isSubmitting} onClick={onNavigateRules}>Rules</Button>
                        <Button className="main-page-rules" variant="light" disabled={isSubmitting} onClick={onNavigateSettings}>Settings</Button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default MainPage
