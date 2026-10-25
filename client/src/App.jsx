import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router";
import { io } from "socket.io-client";
import MainPage from "./components/mainPage/MainPage.jsx";
import Settings from "./components/settings/Settings.jsx";
import Rules from "./components/rulesPage/Rules.jsx";
import StatisticsPage from "./components/statistics/Statistics.jsx";
import GetReady from "./components/battleshipGame/BattleshipGetReady.jsx";
import BattleshipGame from "./components/battleshipGame/BattleshipGame.jsx";
import { initializeSession } from "./session.js";
import { getGame, leaveGame } from "./gameApi.js";
import { createBoard, boardFromShips } from "./board.js";

function App() {
    const navigate = useNavigate();
    const [session, setSession] = useState({ status: "loading", token: null });
    const [game, setGame] = useState(null);
    const [board, setBoard] = useState(createBoard);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState("");
    const [leaving, setLeaving] = useState(false);
    const gameId = game?.id;

    useEffect(() => {
        if (session.status !== "loading") return;
        let active = true;

        async function loadSession() {
            try {
                const token = await initializeSession();
                const savedGameId = localStorage.getItem("gameId");

                if (savedGameId) {
                    try {
                        const savedGame = await getGame(savedGameId);
                        if (!active) return;

                        if (savedGame.phase !== "cancelled") {
                            setGame(savedGame);
                            setBoard(boardFromShips(savedGame.players.you.ships));
                        } else {
                            localStorage.removeItem("gameId");
                        }
                    } catch (error) {
                        if (!active) return;
                        if (
                            error.code === "GAME_NOT_FOUND" ||
                            error.code === "PLAYER_NOT_IN_GAME" ||
                            error.code === "INVALID_GAME_ID"
                        ) {
                            localStorage.removeItem("gameId");
                            setError(error.message);
                        } else {
                            throw error;
                        }
                    }
                }

                if (active) setSession({ status: "ready", token });
            } catch (error) {
                if (active) {
                    setSession({ status: "error", token: null });
                    setError(error.message);
                }
            }
        }

        loadSession();
        return () => {
            active = false;
        };
    }, [session.status]);

    useEffect(() => {
        if (!gameId || !session.token) return;

        const socket = io({ auth: { token: session.token } });

        socket.on("connect", () => {
            socket.emit("game:subscribe", { gameId }, (reply) => {
                if (reply.ok) {
                    setConnected(true);
                    setError("");
                } else {
                    setError(reply.error.message);
                }
            });
        });

        socket.on("game:state", (updatedGame) => {
            if (updatedGame.phase === "cancelled") {
                localStorage.removeItem("gameId");
                setGame(null);
                setError("The lobby was closed.");
            } else {
                setGame(updatedGame);
            }
        });

        socket.on("disconnect", () => setConnected(false));
        socket.on("connect_error", (error) => {
            setConnected(false);
            setError(error.message);
        });

        return () => {
            socket.removeAllListeners();
            socket.disconnect();
        };
    }, [gameId, session.token]);

    function startGame(newGame) {
        localStorage.setItem("gameId", newGame.id);
        setGame(newGame);
        setBoard(createBoard());
        setConnected(false);
        setError("");
        navigate(newGame.phase === "waiting" ? "/lobby/create" : "/ready");
    }

    async function closeGame() {
        if (leaving) return;
        setLeaving(true);
        try {
            await leaveGame(game.id);
            localStorage.removeItem("gameId");
            setGame(null);
            setConnected(false);
            navigate("/");
            setError("");
        } catch (error) {
            setError(error.message);
        } finally {
            setLeaving(false);
        }
    }

    if (session.status === "loading") {
        return <p role="status">Connecting to the server...</p>;
    }

    if (session.status === "error") {
        return (
            <div role="alert">
                <p>{error}</p>
                <button onClick={() => setSession({ status: "loading", token: null })}>
                    Try again
                </button>
            </div>
        );
    }

    let gamePath = "/";
    if (game?.phase === "waiting") gamePath = "/lobby/create";
    if (game?.phase === "placement") gamePath = "/ready";
    if (game?.phase === "battle" || game?.phase === "finished") gamePath = "/game";

    const menu = (
        <MainPage
            game={game}
            onStartGame={startGame}
            onResumeGame={() => navigate(gamePath)}
            onLeaveGame={closeGame}
            leaving={leaving}
        />
    );

    const preparation = (
        <GetReady
            game={game}
            board={board}
            onBoardChange={setBoard}
            disabled={!connected || leaving}
            onGoHome={() => navigate("/")}
            onLeaveGame={closeGame}
        />
    );

    const battle = (
        <BattleshipGame
            game={game}
            disabled={!connected || leaving}
            onGoHome={() => navigate("/")}
            onLeaveGame={closeGame}
        />
    );

    return (
        <>
            {error && (
                <p
                    className="game-message"
                    role="alert"
                >
                    {error}
                </p>
            )}
            {game && !connected && (
                <p
                    className="game-message"
                    role="status"
                >
                    Connecting to the game...
                </p>
            )}
            <Routes>
                <Route path="/" element={menu} />
                <Route
                    path="/lobby"
                    element={game ? <Navigate to={gamePath} replace /> : menu}
                />
                <Route
                    path="/lobby/join"
                    element={game ? <Navigate to={gamePath} replace /> : menu}
                />
                <Route
                    path="/lobby/create"
                    element={
                        game && game.phase !== "waiting"
                            ? <Navigate to={gamePath} replace />
                            : menu
                    }
                />
                <Route
                    path="/ready"
                    element={
                        game?.phase === "placement"
                            ? preparation
                            : <Navigate to={gamePath} replace />
                    }
                />
                <Route
                    path="/game"
                    element={gamePath === "/game" ? battle : <Navigate to={gamePath} replace />}
                />
                <Route
                    path="/settings"
                    element={<Settings onNavigateMain={() => navigate("/")} />}
                />
                <Route
                    path="/rules"
                    element={<Rules onNavigateMain={() => navigate("/")} />}
                />
                <Route
                    path="/statistics"
                    element={<StatisticsPage onHome={() => navigate("/")} />}
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    );
}

export default App;
