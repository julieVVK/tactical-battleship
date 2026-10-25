// Main page by Vladyslav Doroshenko. Lobby dialogs and routes from yullia.
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useLanguage } from "../../i18n/useLanguage.js";
import { createLobby, joinLobby, createComputerGame } from "../../gameApi.js";
import Ship from "../ship/Ship.jsx";
import ProfileMenu from "../profileMenu/ProfileMenu.jsx";
import Button from "../button/Button.jsx";
import "./mainPage.css";

function MainPage({ game, onStartGame, onResumeGame, onLeaveGame, leaving }) {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();
    const [lobbyCode, setLobbyCode] = useState("");
    const [message, setMessage] = useState("");
    const [busy, setBusy] = useState(false);

    const pathToView = {
        "/": "home",
        "/lobby": "lobby",
        "/lobby/join": "join",
        "/lobby/create": "create",
    };
    const lobbyView = pathToView[location.pathname];

    async function handleCreate(computer = false) {
        if (busy || game) return;
        setBusy(true);
        setMessage("");
        try {
            const newGame = computer ? await createComputerGame() : await createLobby();
            onStartGame(newGame);
        } catch (error) {
            setMessage(error.message);
        } finally {
            setBusy(false);
        }
    }

    async function handleJoin(event) {
        event.preventDefault();
        if (busy || game) return;
        setBusy(true);
        setMessage("");
        try {
            const joinedGame = await joinLobby(lobbyCode);
            onStartGame(joinedGame);
        } catch (error) {
            setMessage(error.message);
        } finally {
            setBusy(false);
        }
    }

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(game.id);
            setMessage("Lobby code copied!");
        } catch {
            setMessage("Select the code and copy it manually.");
        }
    }

    return (
        <div className="main-page">
            <Ship />
            <ProfileMenu />
            <div className="main-page-content">
                <h1 className="main-page-title">{t("app.title")}</h1>

                {lobbyView === "home" && (
                    <>
                        <div className="main-page-dialogue">
                            <h2 className="mainPageh1">{t("menu.play")}</h2>
                            <div className="main-page-button-container">
                                <Button
                                    variant="light"
                                    disabled={busy || Boolean(game)}
                                    onClick={() => handleCreate(true)}
                                >
                                    {t("menu.computer")}
                                </Button>
                                <Button
                                    variant="dark"
                                    disabled={busy || Boolean(game)}
                                    onClick={() => navigate("/lobby")}
                                >
                                    {t("menu.twoPlayers")}
                                </Button>
                                {game && (
                                    <Button variant="dark" onClick={onResumeGame}>
                                        Resume game
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className="main-page-links">
                            <Button className="main-page-rules" onClick={() => navigate("/rules")}>
                                {t("nav.rules")}
                            </Button>
                            <Button className="main-page-rules" onClick={() => navigate("/settings")}>
                                {t("nav.settings")}
                            </Button>
                        </div>
                    </>
                )}

                {lobbyView === "lobby" && (
                    <div className="main-page-dialogue lobby-dialogue">
                        <h2 className="mainPageh1">Lobby</h2>
                        <div className="lobby-buttons">
                            <Button disabled={busy} onClick={() => navigate("/lobby/join")}>
                                Join
                            </Button>
                            <Button variant="dark" disabled={busy} onClick={() => handleCreate()}>
                                Create
                            </Button>
                        </div>
                    </div>
                )}

                {(lobbyView === "join" || lobbyView === "create") && (
                    <p className="lobby-subtitle">A classic game of hide and seek at sea.</p>
                )}

                {lobbyView === "join" && (
                    <div className="main-page-dialogue lobby-dialogue">
                        <form className="lobby-form" onSubmit={handleJoin}>
                            <h2 className="mainPageh1">Join a lobby</h2>
                            <label htmlFor="lobby-code">Lobby code</label>
                            <input
                                id="lobby-code"
                                value={lobbyCode}
                                onChange={(event) => setLobbyCode(event.target.value)}
                                placeholder="ABC123"
                                maxLength={6}
                                disabled={busy}
                                required
                            />
                            <p className="lobby-hint">Enter the code your friend shared with you.</p>
                            <Button variant="dark" type="submit" disabled={busy}>
                                Join lobby
                            </Button>
                        </form>
                    </div>
                )}

                {lobbyView === "create" && (
                    <div className="main-page-dialogue lobby-dialogue">
                        <div className="lobby-form">
                            <h2 className="mainPageh1">Create a lobby</h2>
                            {game ? (
                                <>
                                    <label htmlFor="invite-code">Your lobby code</label>
                                    <input id="invite-code" value={game.id} readOnly />
                                    <p>Player: {game.players.you.name}</p>
                                    <p className="lobby-hint">
                                        Share this code with a friend to invite them.
                                    </p>
                                    <Button variant="dark" onClick={handleCopy}>Copy code</Button>
                                    <p className="lobby-waiting">Waiting for another player...</p>
                                    <Button disabled={leaving} onClick={onLeaveGame}>
                                        Close lobby
                                    </Button>
                                </>
                            ) : (
                                <Button variant="dark" disabled={busy} onClick={() => handleCreate()}>
                                    Create lobby
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {message && <p role="status" className="lobby-message">{message}</p>}
                {lobbyView !== "home" && (
                    <Button
                        className="lobby-back"
                        disabled={busy || leaving}
                        onClick={() => {
                            setMessage("");
                            navigate(game || lobbyView === "lobby" ? "/" : "/lobby");
                        }}
                    >
                        Back
                    </Button>
                )}
            </div>
        </div>
    );
}

export default MainPage;
