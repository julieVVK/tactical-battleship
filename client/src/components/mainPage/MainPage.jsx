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
            setMessage("lobby.copied");
        } catch {
            setMessage("lobby.copyFailed");
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
                        <p>{t(error)}</p>
                    </div>
                )}
                {connectionError && (
                    <div role="alert" className="lobby-message">
                        <p>{t(connectionError)}</p>
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
                            flexWrap: "wrap",
                            justifyContent: "center",
                            maxWidth: "100%",
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
                            <h2 className="mainPageh1">{t("lobby.title")}</h2>
                            <div className="lobby-buttons">
                                <Button style={{ width: "100%", padding: "0.5rem 1rem" }}
                                    variant="light"
                                    to="/lobby/join"
                                >
                                    {t("lobby.join")}
                                </Button>

                                <Button style={{ width: "100%", padding: "0.5rem 1rem" }}
                                    variant="dark"
                                    onClick={handleCreate}
                                    disabled={pending}
                                >
                                    {t(pending ? "lobby.connecting" : game ? "lobby.open" : "lobby.create")}
                                </Button>
                            </div>
                        </div>
                    </>
                )}

                {/* STATE 3 - JOIN LOBBY */}
                {lobbyView === "join" && (
                    <>
                        <div className="main-page-dialogue lobby-dialogue" >
                            <form className="lobby-form" onSubmit={handleJoin}>

                                <h2 className="mainPageh1">{t("lobby.joinTitle")}</h2>

                                <label htmlFor="lobby-code">
                                    {t("lobby.code")}
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
                                    placeholder={t("lobby.placeholder")}
                                    required
                                />

                                <p className="lobby-hint">
                                    {t("lobby.hint")}
                                </p>

                                <Button variant="dark" type="submit" disabled={pending} style={{ width: "100%", padding: "0.5rem 1rem" }}>
                                    {t(pending ? "lobby.joining" : "lobby.joinButton")}
                                </Button>
                                {message && (
                                <p role="status" className="lobby-message">
                                    {t(message)}
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
                                <h2 className="mainPageh1">{t(game ? "lobby.yourLobby" : "lobby.createTitle")}</h2>

                                <label htmlFor="invite-code">
                                    {t("lobby.yourCode")}
                                </label>

                                <button
                                    type="button"
                                    id="invite-code"
                                    className="lobby-generated-code"
                                    disabled={!game}
                                    aria-label={t("lobby.copyCode")}
                                    title={t("lobby.copyCodeHint")}
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
                                            {t("lobby.copyLink")}
                                        </Button>

                                        <p className="lobby-hint">
                                            {t("lobby.shareHint")}
                                        </p>
                                        {message && <p role="status" className="lobby-message">{t(message)}</p>}
                                        <p role="status" className="lobby-waiting">{t("lobby.waiting")}</p>
                                    </>
                                ) : (
                                    <Button variant="dark" onClick={handleCreate} disabled={pending}>
                                        {t(pending ? "lobby.connecting" : "lobby.createButton")}
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
                        {t("nav.back")}
                    </Button>
                )}
                </div>
            </div>
        </>
    );

}
export default MainPage
