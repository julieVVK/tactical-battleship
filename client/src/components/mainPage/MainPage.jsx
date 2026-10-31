// File was created by Vladyslav Doroshenko
import { useState } from "react";
import { useLanguage } from '../../i18n/useLanguage.js';
import Ship from "../ship/Ship.jsx";
import ProfileMenu from "../profileMenu/ProfileMenu.jsx";
import Button from "../button/Button.jsx";
import "./mainPage.css";
import { Navigate, useLocation, useNavigate } from "react-router";


function MainPage({ lobby, onPlayWithPC, gameError }) {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();

    const pathToView = {
        "/": "home",
        "/lobby": "lobby",
        "/lobby/join": "join",
        "/lobby/create": "create",
    };

    const lobbyView = pathToView[location.pathname] ?? "home";

    const [lobbyCode, setLobbyCode] = useState(() =>
        new URLSearchParams(location.search).get("code") ?? ""
    );
    const { game, pending, error, connectionError, openLobby } = lobby;
    const [message, setMessage] = useState("");

    const handleCopy = async (value) => {
        try {
            await navigator.clipboard.writeText(value);
            setMessage("Copied!");
        } catch {
            setMessage("Could not copy. You can select and copy the code above.");
        }
    };

    const handleCreate = async () => {
        setMessage("");
        const view = await openLobby();
        if (view) navigate("/lobby/create");
    };

    const handleJoin = async (event) => {
        event.preventDefault();
        setMessage("");
        const view = await openLobby(lobbyCode);
        if (view) navigate("/lobby/create");
    };

    if (lobbyView === "create" && game?.players.opponent) {
        return <Navigate to="/ready" replace />;
    }


    return (
        <>
            <div className="main-page">
                <Ship />
                <ProfileMenu />


                <div className="main-page-content">
                <h1 className="main-page-title">{t("app.title")}</h1>

                {gameError && <p role="alert" className="lobby-message">{gameError}</p>}

                {error && (
                    <div role="alert" className="lobby-message">
                        <p>{error}</p>
                    </div>
                )}
                {connectionError && (
                    <div role="alert" className="lobby-message">
                        <p>{connectionError}</p>
                    </div>
                )}

                {/* STATE 1 - HOME */}
                {lobbyView === "home" && (
                    <>
                        <div className="main-page-dialogue">
                            <h2 className="mainPageh1">{t("menu.play")}</h2>

                            <div className="main-page-button-container">
                                <Button variant="light" onClick={onPlayWithPC}>
                                    {t("menu.computer")}
                                </Button>

                                <Button
                                    variant="dark"
                                    to="/lobby"
                                >
                                    {t("menu.twoPlayers")}
                                </Button>
                            </div>
                        </div>

                        <div style={{
                            display: "flex",
                            flexDirection: "row",
                            gap: "0.5rem"
                        }}>
                            <Button
                                className="main-page-rules"
                                variant="light"
                                to="/rules"
                            >
                                {t("nav.rules")}
                            </Button>

                            <Button
                                className="main-page-rules"
                                variant="light"
                                to="/settings"
                            >
                                {t("nav.settings")}
                            </Button>
                        </div>
                    </>
                )}

                {/* STATE 2 - LOBBY */}
                {lobbyView === "lobby" && (
                    <>
                        <div className="main-page-dialogue lobby-dialogue">
                            <h2 className="mainPageh1">Lobby</h2>
                            <div className="lobby-buttons" >
                            <div style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    width: "8rem",
                                    minWidth: "8rem",
                                    alignItems: "stretch",
                                    gap: "0.5rem"
                                }}>
                                <Button style={{ width: "100%", padding: "0.5rem 1rem" }}
                                    variant="light"
                                    to="/lobby/join"
                                >
                                    Join
                                </Button>

                                <Button style={{ width: "100%", padding: "0.5rem 1rem" }}
                                    variant="dark"
                                    onClick={handleCreate}
                                    disabled={pending}
                                >
                                    {pending ? "Connecting..." : game ? "Open lobby" : "Create"}
                                </Button>
                            </div>
                            </div>
                        </div>
                    </>
                )}

                {/* STATE 3 - JOIN LOBBY */}
                {lobbyView === "join" && (
                    <>
                        <div className="main-page-dialogue lobby-dialogue" >
                            <form className="lobby-form" onSubmit={handleJoin}>

                                <h2 className="mainPageh1">Join a lobby</h2>

                                <label htmlFor="lobby-code">
                                    Lobby code or invitation link
                                </label>

                                <input 
                                    style={{ textTransform: "uppercase",
                                             alignContent: "center",
                                             width: "100%"}}
                                    id="lobby-code"
                                    type="text"
                                    value={lobbyCode}
                                    onChange={(e) => { setLobbyCode(e.target.value); setMessage(""); }}
                                    disabled={pending}
                                    placeholder="ABC123 or paste a lobby link"
                                    required
                                />

                                <p className="lobby-hint">
                                    Both formats work. Paste the full invitation link.
                                </p>

                                <Button variant="dark" type="submit" disabled={pending} style={{ width: "100%", padding: "0.5rem 1rem" }}>
                                    {pending ? "Joining..." : "Join lobby"}
                                </Button>
                                {message && (
                                <p role="status" className="lobby-message">
                                    {message}
                                </p>
                                )}
                            </form>
                        </div>
                    </>
                )}

                {/* STATE 4 - CREATE LOBBY */}
                {lobbyView === "create" && (
                    <>
                        <div className="main-page-dialogue lobby-dialogue">
                            <div className="lobby-form">
                                <h2 className="mainPageh1">{game ? "Your lobby" : "Create a lobby"}</h2>

                                <label htmlFor="invite-code">
                                    Your lobby code
                                </label>

                                <button
                                    type="button"
                                    id="invite-code"
                                    className="lobby-generated-code"
                                    disabled={!game}
                                    aria-label="Copy lobby code"
                                    title="Click to copy code"
                                    onClick={() => handleCopy(game.id)}
                                >
                                    {game?.id ?? ""}
                                </button>
                                
                                {game ? (
                                    <>
                                        <Button
                                            variant="light"
                                            style={{ alignSelf: "center" }}
                                            onClick={() => handleCopy(`${window.location.origin}/lobby/join?code=${game.id}`)}>
                                            Copy invitation link
                                        </Button>

                                        <p className="lobby-hint">
                                            Share this code or an invitation link with a friend.
                                        </p>
                                        {message && <p role="status" className="lobby-message">{message}</p>}
                                        <p role="status" className="lobby-waiting">Waiting for another player...</p>
                                    </>
                                ) : (
                                    <Button variant="dark" onClick={handleCreate} disabled={pending}>
                                        {pending ? "Connecting..." : "Create lobby"}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* BACK BUTTON */}
                {lobbyView !== "home" && (
                    <Button style={{ width: "40%", padding: "0.5rem 1rem" }}
                        className="lobby-back"
                        to={lobbyView === "lobby" ? "/" : "/lobby"}
                        onClick={() => setMessage("")}
                    >
                        Back
                    </Button>
                )}
                </div>
            </div>
        </>
    );

}
export default MainPage
