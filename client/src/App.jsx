import MainPage from "./components/mainPage/MainPage.jsx";
import Settings from "./components/settings/Settings.jsx";
import Rules from "./components/rulesPage/Rules.jsx";
import GetReady from "./components/battleshipGame/BattleshipGetReady.jsx";
import BattleshipGame from "./components/battleshipGame/BattleshipGame.jsx";
import StatisticsPage from "./components/statistics/Statistics.jsx";
import {useCallback, useEffect, useLayoutEffect, useRef, useState} from "react";
import {Navigate, Route, Routes, useLocation, useNavigate} from "react-router";
import {getLobby} from "./api/lobby.js";
import {clearSession, clearStoredGame, getSessionToken} from "./api/session.js";
import useGameSocket from "./hooks/useGameSocket.js";
import Button from "./components/button/Button.jsx";
import {BOARD_SIZE} from "./constants.js";
import "./app.css";

// author: Vladyslav Doroshenko xdorosv00
function getPlayerBoard(game) {
    const board = Array.from({length: BOARD_SIZE}, () => Array.from({length: BOARD_SIZE}, () => ({
        hasShip: false,
        hit: false,
        miss: false
    })),);
    for (const ship of game.players.you.ships) {
        for (const cell of ship.cells) {
            board[cell.row][cell.col] = {hasShip: true, shipId: ship.id, hit: cell.hit, miss: false};
        }
    }
    for (const shot of game.players.opponent?.shots || []) {
        if (shot.result === "miss") board[shot.row][shot.col].miss = true;
    }
    return board;
}

function App() {
    const navigate = useNavigate();
    const {pathname} = useLocation();
    const navigation = useRef({navigate, pathname});

    // Keep socket callbacks and the restoration effect stable when the URL changes.
    useLayoutEffect(() => {
        navigation.current = {navigate, pathname};
    }, [navigate, pathname]);

    const [game, setGame] = useState(null);
    const [token, setToken] = useState(getSessionToken);
    const [gameError, setGameError] = useState("");
    const [isRestoring, setIsRestoring] = useState(() => Boolean(localStorage.getItem("gameId")));

    // author:xhaziyh00 - Persisted 10x10 player board matrix with placed fleet coordinates
    const [playerBoardData, setPlayerBoardData] = useState(null);

    // author:xhaziyh00 - Persisted player ships registry holding orientation and placement states
    const [playerShips, setPlayerShips] = useState(null);

    // author: Vladyslav Doroshenko xdorosv00
    const handleEnterGame = useCallback((receivedGame, restoring = false) => {
        setGame(receivedGame);
        setToken(getSessionToken());
        setGameError("");
        const isBattle = ["battle", "finished"].includes(receivedGame.phase);
        setPlayerBoardData(isBattle ? getPlayerBoard(receivedGame) : null);
        setPlayerShips(null);
        const {navigate, pathname} = navigation.current;
        if (!restoring || ["/", "/game", "/game/ready"].includes(pathname)) {
            navigate(receivedGame.phase === "waiting" ? "/" : isBattle ? "/game" : "/game/ready", {replace: restoring});
        }
    }, []);

    // author: Vladyslav Doroshenko xdorosv00
    const handleGameState = useCallback(receivedGame => {
        setGame(receivedGame);
        if (["battle", "finished"].includes(receivedGame.phase)) {
            setPlayerBoardData(getPlayerBoard(receivedGame));
        }
        const {navigate, pathname} = navigation.current;
        if (pathname === "/" && receivedGame.phase === "placement") {
            navigate("/game/ready", {replace: true});
        } else if (pathname === "/game/ready" && ["battle", "finished"].includes(receivedGame.phase)) {
            navigate("/game", {replace: true});
        }
    }, []);

    // author: Vladyslav Doroshenko xdorosv00
    const handleGameLost = useCallback(message => {
        clearStoredGame();
        setGame(null);
        setPlayerBoardData(null);
        setPlayerShips(null);
        navigation.current.navigate("/", {replace: true});
        setGameError(message);
    }, []);

    // author: Vladyslav Doroshenko xdorosv00
    const handleSessionLost = useCallback(message => {
        clearSession();
        setToken(null);
        handleGameLost(message);
    }, [handleGameLost]);

    // author: Vladyslav Doroshenko xdorosv00
    const connection = useGameSocket({
        gameId: game?.phase === "finished" ? null : game?.id,
        token,
        onGameState: handleGameState,
        onSessionLost: handleSessionLost,
        onGameLost: handleGameLost,
    });

    // author: Vladyslav Doroshenko xdorosv00
    const loadStoredGame = useCallback(signal => {
        const gameId = localStorage.getItem("gameId");
        if (!gameId) return;

        return getLobby(gameId, {signal})
            .then(restoredGame => {
                if (!signal.aborted) handleEnterGame(restoredGame, true);
            })
            .catch(error => {
                if (signal.aborted) return;
                if (error.code === "SESSION_NOT_FOUND") handleSessionLost(error.message); else if (["GAME_NOT_FOUND", "INVALID_GAME_ID", "PLAYER_NOT_IN_GAME"].includes(error.code)) {
                    handleGameLost(error.message);
                } else setGameError(error.message);
            })
            .finally(() => {
                if (!signal.aborted) setIsRestoring(false);
            });
    }, [handleEnterGame, handleGameLost, handleSessionLost]);

    useEffect(() => {
        const controller = new AbortController();
        loadStoredGame(controller.signal);
        return () => controller.abort();
    }, [loadStoredGame]);

    // author: Vladyslav Doroshenko xdorosv00
    function restoreGame() {
        if (isRestoring || !localStorage.getItem("gameId")) return;
        setIsRestoring(true);
        setGameError("");
        loadStoredGame(new AbortController().signal);
    }

    // author: Vladyslav Doroshenko xdorosv00
    function resumeGame() {
        if (!game) return;
        if (["battle", "finished"].includes(game.phase)) {
            setPlayerBoardData(getPlayerBoard(game));
            navigate("/game");
        } else if (game.phase === "placement") navigate("/game/ready");
    }

    // author: Vladyslav Doroshenko xdorosv00
    const mainPageProps = {
        game,
        onStartGame: handleEnterGame,
        onResumeGame: resumeGame,
        onNavigateSettings: () => navigate("/settings"),
        onNavigateRules: () => navigate("/rules"),
        onNavigateStatistics: () => navigate("/statistics"),
        isRestoring,
        gameError,
        onRestoreGame: restoreGame,
        canRestore: !game && Boolean(localStorage.getItem("gameId")),
        connection,
    };


    // author: xhaziyh00
    const handleStartBattle = (boardData, ships) => {
        setPlayerBoardData(boardData);
        setPlayerShips(ships);
        navigate("/game");
    };

    /*TODO: Fix state reset due to component re-mounting via handling saved settings through props
    *       sound settings still need persistence.
    *       Language is handled by LanguageProvider.
    *       Add isDirty, savedProfile, draftProfile
    * */

    // author: Vladyslav Doroshenko xdorosv00
    function renderGameScreen(isBattle) {
        if (isRestoring) return <p role="status">Restoring your game...</p>;
        if (!game || game.phase === "waiting") return <Navigate to="/" replace/>;

        const battleStarted = ["battle", "finished"].includes(game.phase);
        if (!isBattle && battleStarted) return <Navigate to="/game" replace/>;
        if (isBattle && !battleStarted && !playerBoardData) return <Navigate to="/game/ready" replace/>;

        return isBattle ? <BattleshipGame
            key={game.id}
            game={game}
            onGoHome={() => navigate("/")}
            initialBoardData={playerBoardData}
            initialShips={playerShips}
        /> : <GetReady
            key={game.id}
            game={game}
            onGoHome={() => navigate("/")}
            onStartBattle={handleStartBattle}
        />;
    }

    return (<>
        <Routes>
            <Route path="/" element={<MainPage key={game?.id || "menu"} {...mainPageProps}/>}/>
            <Route path="/settings" element={<Settings onNavigateMain={() => navigate("/")}/>}/>
            <Route path="/rules" element={<Rules onNavigateMain={() => navigate("/")}/>}/>
            <Route path="/statistics" element={<StatisticsPage onHome={() => navigate("/")}/>}/>
            <Route path="/game/ready" element={renderGameScreen(false)}/>
            <Route path="/game" element={renderGameScreen(true)}/>
            <Route path="*" element={<Navigate to="/" replace/>}/>
        </Routes>
        {pathname !== "/" && connection.error && (<div className="game-connection-status" role="alert">
            <p>{connection.error}</p>
            <Button onClick={connection.reconnect}>Reconnect</Button>
        </div>)}
    </>);
}

export default App;
