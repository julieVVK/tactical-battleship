import MainPage from "./components/mainPage/MainPage.jsx";
import Settings from "./components/settings/Settings.jsx";
import Rules from "./components/rulesPage/Rules.jsx";
import GetReady from "./components/battleshipGame/BattleshipGetReady.jsx";
import BattleshipGame from "./components/battleshipGame/BattleshipGame.jsx";
import { useCallback, useEffect, useState } from "react";
import { getLobby } from "./api/lobby.js";
import { clearSession, clearStoredGame, getSessionToken } from "./api/session.js";
import useGameSocket from "./hooks/useGameSocket.js";
import Button from "./components/button/Button.jsx";
import { BOARD_SIZE } from "./constants.js";
import "./app.css";

// author: Vladyslav Doroshenko xdorosv00
function getPlayerBoard(game) {
  const board = Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => ({ hasShip: false, hit: false, miss: false })),
  );
  for (const ship of game.players.you.ships) {
    for (const cell of ship.cells) {
      board[cell.row][cell.col] = { hasShip: true, shipId: ship.id, hit: cell.hit, miss: false };
    }
  }
  for (const shot of game.players.opponent?.shots || []) {
    if (shot.result === "miss") board[shot.row][shot.col].miss = true;
  }
  return board;
}

function App() {
  const [screen, setScreen] = useState("menu");
  const [game, setGame] = useState(null);
  const [token, setToken] = useState(getSessionToken);
  const [gameError, setGameError] = useState("");
  const [isRestoring, setIsRestoring] = useState(() => Boolean(localStorage.getItem("gameId")));

  // author:xhaziyh00 - Persisted 10x10 player board matrix with placed fleet coordinates
  const [playerBoardData, setPlayerBoardData] = useState(null);

  // author:xhaziyh00 - Persisted player ships registry holding orientation and placement states
  const [playerShips, setPlayerShips] = useState(null);

  // author: Vladyslav Doroshenko xdorosv00
  const handleEnterGame = useCallback(receivedGame => {
    setGame(receivedGame);
    setToken(getSessionToken());
    setGameError("");
    const isBattle = ["battle", "finished"].includes(receivedGame.phase);
    setPlayerBoardData(isBattle ? getPlayerBoard(receivedGame) : null);
    setPlayerShips(null);
    setScreen(receivedGame.phase === "waiting" ? "menu" : isBattle ? "battle" : "ready");
  }, []);

  // author: Vladyslav Doroshenko xdorosv00
  const handleGameState = useCallback(receivedGame => {
    setGame(receivedGame);
    if (["battle", "finished"].includes(receivedGame.phase)) {
      setPlayerBoardData(getPlayerBoard(receivedGame));
    }
    setScreen(current => {
      if (current === "menu" && receivedGame.phase === "placement") return "ready";
      if (current === "ready" && ["battle", "finished"].includes(receivedGame.phase)) return "battle";
      return current;
    });
  }, []);

  // author: Vladyslav Doroshenko xdorosv00
  const handleGameLost = useCallback(message => {
    clearStoredGame();
    setGame(null);
    setPlayerBoardData(null);
    setPlayerShips(null);
    setScreen("menu");
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

    return getLobby(gameId, { signal })
      .then(restoredGame => {
        if (!signal.aborted) handleEnterGame(restoredGame);
      })
      .catch(error => {
        if (signal.aborted) return;
        if (error.code === "SESSION_NOT_FOUND") handleSessionLost(error.message);
        else if (["GAME_NOT_FOUND", "INVALID_GAME_ID", "PLAYER_NOT_IN_GAME"].includes(error.code)) {
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
      setScreen("battle");
    } else if (game.phase === "placement") setScreen("ready");
  }

  // author: Vladyslav Doroshenko xdorosv00
  const mainPageProps = {
    game,
    onStartGame: handleEnterGame,
    onResumeGame: resumeGame,
    onNavigateSettings: () => setScreen("settings"),
    onNavigateRules: () => setScreen("rules"),
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
    setScreen("battle");
  };

  //TODO: Implement React Router
  /*TODO: Fix state reset due to component re-mounting via handling saved settings through props
  *       sound and language will be stored in `const localStorage`.
  *       Add isDirty, savedProfile, draftProfile
  * */

  // author: Vladyslav Doroshenko xdorosv00
  function renderScreen() {
    switch (screen) {
      case "menu":
        return <MainPage key={game?.id || "menu"} {...mainPageProps} />;

      case "settings":
        return <Settings onNavigateMain={() => setScreen("menu")} />;

      case "rules":
        return <Rules onNavigateMain={() => setScreen("menu")} />;

      case "ready":
        return (
          <GetReady
            key={game?.id}
            game={game}
            onGoHome={() => setScreen("menu")}
            onStartBattle={handleStartBattle}
          />
        );

      case "battle":
        return (
          <BattleshipGame
            key={game?.id}
            game={game}
            onGoHome={() => setScreen("menu")}
            initialBoardData={playerBoardData}
            initialShips={playerShips}
          />
        );

      default:
        return <MainPage key={game?.id || "menu"} {...mainPageProps} />;
    }
  }

  return (
    <>
      {renderScreen()}
      {screen !== "menu" && connection.error && (
        <div className="game-connection-status" role="alert">
          <p>{connection.error}</p>
          <Button onClick={connection.reconnect}>Reconnect</Button>
        </div>
      )}
    </>
  );
}
export default App;
