import MainPage from "./components/mainPage/MainPage.jsx";
import Settings from "./components/settings/Settings.jsx";
import Rules from "./components/rulesPage/Rules.jsx";
import GetReady from "./components/battleshipGame/BattleshipGetReady.jsx";
import BattleshipGame from "./components/battleshipGame/BattleshipGame.jsx";
import socket from "./socket.js";
import StatisticsPage from "./components/statistics/Statistics.jsx";
import { useEffect, useState } from "react";
import { initializeSession } from "./session.js";

function App() {
  const [screen, setScreen] = useState("menu");
  const [session, setSession] = useState({ status: "loading", error: null });

  // author: Vladyslav Doroshenko
  // Create random user
  useEffect(() => {
    if (session.status !== "loading") return;

    initializeSession().then(
      () => {
        setSession({ status: "ready", error: null });
      },
      (error) => {
        setSession({ status: "error", error: error.message });
      },
    );
  }, [session.status]);

  function retrySession() {
    setSession({ status: "loading", error: null });
  }

  // author:xhaziyh00 - Persisted 10x10 player board matrix with placed fleet coordinates
  const [playerBoardData, setPlayerBoardData] = useState(null);

  // author:xhaziyh00 - Persisted player ships registry holding orientation and placement states
  const [playerShips, setPlayerShips] = useState(null);

  const [serverBoardData, setServerBoardData] = useState(null);
  // Чисто для теста на фронте:
  const testGameId = "A1B2C3"; // то, что выдал бы makeGameId
  const testUserId = "USER-1"; // то, что взял бы makePlayer из user.id
  /**
   * Transition callback from preparation dock to active combat arena.
   * Caches finalized fleet configuration and triggers battle screen mount.
   *
   * @author xhaziyh00
   * @param {Array<Array<Object>>} boardData - Populated 10x10 board matrix.
   * @param {Array<Object>} ships - List of configured ship entities.
   */

  const handleStartBattle = (boardData, ships, serverBoard) => {
    setPlayerBoardData(boardData);
    setPlayerShips(ships);
    setServerBoardData(serverBoard);
    setScreen("battle");
  };

  //TODO: Implement React Router
  /*TODO: Fix state reset due to component re-mounting via handling saved settings through props
   *       sound settings still need persistence.
   *       Language is handled by LanguageProvider.
   *       Add isDirty, savedProfile, draftProfile
   * */

  // author: Vladyslav Doroshenko
  if (session.status === "loading") {
    return <p role="status">Connecting to the server...</p>;
  }
  if (session.status === "error") {
    return (
      <div role="alert">
        <p>{session.error}</p>
        <button type="button" onClick={retrySession}>
          Try again
        </button>
      </div>
    );
  }

  // author:xhaziyh00 - Declarative client-side screen switcher
  switch (screen) {
    case "menu":
      return (
        <MainPage
          onStartGame={() => setScreen("ready")}
          onNavigateSettings={() => setScreen("settings")}
          onNavigateRules={() => setScreen("rules")}
          onNavigateStatistics={() => setScreen("statistics")}
        />
      );

    case "settings":
      return <Settings onNavigateMain={() => setScreen("menu")} />;

    case "rules":
      return <Rules onNavigateMain={() => setScreen("menu")} />;

    case "ready":
      return <GetReady onGoHome={() => setScreen("menu")} onStartBattle={handleStartBattle} gameId={testGameId} userId={testUserId} socket={socket} />;

    case "battle":
      return (
        <BattleshipGame
          onGoHome={() => setScreen("menu")}
          initialBoardData={playerBoardData}
          initialShips={playerShips}
          serverBoard={serverBoardData}
          gameId={testGameId}
          userId={testUserId}
          socket={socket}
        />
      );

    case "statistics":
      return <StatisticsPage onHome={() => setScreen("menu")} />;

    default:
      // author:xhaziyh00 - Fallback to main menu if unknown screen state is passed
      return (
        <MainPage
          onStartGame={() => setScreen("ready")}
          onNavigateSettings={() => setScreen("settings")}
          onNavigateRules={() => setScreen("rules")}
          onNavigateStatistics={() => setScreen("statistics")}
        />
      );
  }
}
export default App;
