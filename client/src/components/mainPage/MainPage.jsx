// File was created by Vladyslav Doroshenko
import { useState } from "react";
import { useLanguage } from '../../i18n/useLanguage.js';
import Ship from "../ship/Ship.jsx";
import ProfileMenu from "../profileMenu/ProfileMenu.jsx";
import Button from "../button/Button.jsx";
import "./mainPage.css";



function MainPage({ onNavigateSettings, onNavigateRules, onStartGame, onNavigateStatistics }) {
    const { t } = useLanguage();

    const [lobbyView, setLobbyView] = useState("home");
    const [lobbyCode, setLobbyCode] = useState("");
    const [inviteCode] = useState(() =>
        Math.random().toString(36).slice(2, 8).toUpperCase()
            );

    const handleJoin = (e) => {
        e.preventDefault();
        if (!lobbyCode.trim()) return;

        // TODO: Connect to backend
    };

const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteCode);
};
    return (
        <>
            <div className="main-page">
                <Ship />
                <ProfileMenu onNavigateStatistics={onNavigateStatistics}/>


                <div className="main-page-content">
                <h1 className="main-page-title">{t("app.title")}</h1>

                {/* STATE 1 - HOME */}
                {lobbyView == "home" && (
                    <>
                        <div className="main-page-dialogue">
                            <h2 className="mainPageh1">{t("menu.play")}</h2>

                            <div className="main-page-button-container">
                                <Button variant="light">
                                    {t("menu.computer")}
                                </Button>

                                <Button
                                    variant="dark"
                                    onClick={() => setLobbyView("lobby")}
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
                                onClick={onNavigateRules}
                            >
                                {t("nav.rules")}
                            </Button>

                            <Button
                                className="main-page-rules"
                                variant="light"
                                onClick={onNavigateSettings}
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
                                    width: "8 rem",
                                    minWidth: "8 rem",
                                    alignItems: "stretch",
                                    gap: "0.5rem"
                                }}>
                                <Button style={{ width: "100%", padding: "0.5rem 1rem" }}
                                    variant="light"
                                    onClick={() => setLobbyView("join")}
                                >
                                    Join
                                </Button>

                                <Button style={{ width: "100%", padding: "0.5rem 1rem" }}
                                    variant="dark"
                                    onClick={() => setLobbyView("create")}
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

                                <Button variant="dark" type="submit" style={{ width: "100%", padding: "0.5rem 1rem" }}>
                                    Join lobby
                                </Button>
                            </form>
                        </div>
                    </>
                )}

                {/* STATE 4 - CREATE LOBBY */}
                {lobbyView == "create" && (
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
                                    value={inviteCode}
                                    readOnly
                                />

                                <p className="lobby-hint">
                                    Share this code with a friend to invite them.
                                </p>

                                <Button variant="dark" onClick={handleCopy} style={{ width: "100%", padding: "0.5rem 1rem" }}>
                                    Copy code
                                </Button>

                                <p className="lobby-waiting">
                                    o Waiting for another player...
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
                                setLobbyView("home");
                            } else {
                                setLobbyView("lobby");
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
