// File was created by Vladyslav Doroshenko

// And later modified by Yuliia Vovk
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

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(game.id);
            setMessage(t("lobby.copied"));
        } catch {
            setMessage(t("lobby.copyFailed"));
        }
    };

    const handleCreate = async () => {
        setMessage("");
        if (await openLobby()) navigate("/lobby/create");
    };

    const handleJoin = async (event) => {
        event.preventDefault();
        if (await openLobby(lobbyCode)) navigate("/ready");
    };

    const handleBack = () => {
        setLobbyCode("");
        setMessage("");
        navigate("/lobby");
    };

    if (lobbyView === "create" && game?.players.opponent) {
        return <Navigate to="/ready" replace />;
    }

    return (
        <>
            <div className="main-page">
                <Ship />
                <ProfileMenu onNavigateStatistics={() => navigate("/statistics")} />


                <div className="main-page-content">
                <h1 className="main-page-title">{t("app.title")}</h1>
                {(error || connectionError || gameError) && (
                    <p role="alert" className="lobby-message">{error || connectionError ? t(error || connectionError) : gameError}</p>
                )}

                {/* STATE 1 - HOME */}
                {lobbyView == "home" && (
                    <>
                        <div className="main-page-dialogue">
                            <h2 className="mainPageh1">{t("menu.play")}</h2>

                            <div className="main-page-button-container">
                                <Button variant="light" onClick={onPlayWithPC}>
                                    {t("menu.computer")}
                                </Button>

                                <Button
                                    variant="dark"
                                    onClick={() => navigate("/lobby")}
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
                {lobbyView == "lobby" && (
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
                                    onClick={() => navigate("/lobby/join")}
                                >
                                    Join
                                </Button>

                                <Button style={{ width: "100%", padding: "0.5rem 1rem" }}
                                    variant="dark"
                                    onClick={handleCreate}
                                    disabled={pending}
                                >
                                    Create
                                </Button>
                            </div>
                            </div>
                        </div>
                    </>
                )}

                {/* STATE 3 - JOIN LOBBY */}
                {lobbyView == "join" && (
                    <>
                        <p className="lobby-subtitle">
                            A classic game of hide and seek at sea
                        </p>

                        <div className="main-page-dialogue lobby-dialogue" >
                            <form className="lobby-form" onSubmit={handleJoin}>

                                <h2 className="mainPageh1">Join a lobby</h2>

                                <label htmlFor="lobby-code">
                                    Lobby code or invitation link
                                </label>

                                <input 
                                    style={{ textTransform: "uppercase",
                                             alignContent: "center",
                                             width: "100%",
                                             height: "2rem"}}
                                    id="lobby-code"
                                    type="text"
                                    value={lobbyCode}
                                    onChange={(e) => setLobbyCode(e.target.value)}
                                    placeholder="ABC123 or paste a lobby link"
                                    required
                                />

                                <p className="lobby-hint">
                                    Both formats work. Paste the full invitation link.
                                </p>

                                <Button variant="dark" type="submit" disabled={pending} style={{ width: "100%", padding: "0.5rem 1rem" }}>
                                    Join lobby
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
                {lobbyView == "create" && !game && <Navigate to="/lobby" replace />}
                {lobbyView == "create" && game && (
                    <>
                        <p className="lobby-subtitle">
                            A classic game of hide and seek at sea.
                        </p>

                        <div className="main-page-dialogue lobby-dialogue">
                            <div className="lobby-form">
                                <h2 className="mainPageh1">Create a lobby</h2>

                                <label htmlFor="invite-code">
                                    Your lobby code
                                </label>

                                <input  style={{ textTransform: "uppercase",
                                             alignContent: "center",
                                             width: "100%",
                                             height: "2rem"}}
                                    id="invite-code"
                                    className="lobby-generated-code"
                                    value={game.id}
                                    readOnly
                                />
                                
                                <p className="lobby-hint">
                                    Share this code with a friend to invite them.
                                </p>

                                <Button variant="dark" onClick={handleCopy} style={{ width: "100%", padding: "0.5rem 1rem" }}>
                                    Copy code
                                </Button>

                                {message && (
                                <p role="status" className="lobby-message">
                                    {message}
                                </p>
                                )}
                                <p className="lobby-waiting">
                                    {t("lobby.waiting")}
                                </p>
                            </div>
                        </div>
                    </>
                )}

                {/* BACK BUTTON */}
                {lobbyView != "home" && (
                    <button style={{ width: "40%", padding: "0.5rem 1rem" }}
                        type="button"
                        className="lobby-back"
                        onClick={() => {
                            if (lobbyView == "lobby") {
                                navigate("/");
                            } else {
                                handleBack();
                            }
                        }}
                    >
                        Back
                    </button>
                )}
                </div>
            </div>
        </>
    );

}
export default MainPage
