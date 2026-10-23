import MainPage from "./components/mainPage/MainPage.jsx";
import Settings from "./components/settings/Settings.jsx";
import Rules from "./components/rulesPage/Rules.jsx";
import GetReady from "./components/battleshipGame/BattleshipGetReady.jsx";
import BattleshipGame from "./components/battleshipGame/BattleshipGame.jsx";
import StatisticsPage from "./components/statistics/Statistics.jsx";
import { useEffect, useState } from "react";
import { initializeSession } from "./session.js";
import {Routes, Route, useNavigate} from "react-router";

function App() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState("menu");
  const [session, setSession] = useState({ status: "loading", error: null });

  // author: Vladyslav Doroshenko
  // Create random user
  useEffect(() => {
    if (session.status !== "loading")
      return;

    initializeSession().then( () => {
      setSession({ status: "ready", error: null });
    }, (error) => {
      setSession({ status: "error", error: error.message });
    });
  }, [session.status]);

  function retrySession() {
    setSession({ status: "loading", error: null });
  }


  // author:xhaziyh00 - Persisted 10x10 player board matrix with placed fleet coordinates
  const [playerBoardData, setPlayerBoardData] = useState(null);

  // author:xhaziyh00 - Persisted player ships registry holding orientation and placement states
  const [playerShips, setPlayerShips] = useState(null);

  /**
   * Transition callback from preparation dock to active combat arena.
   * Caches finalized fleet configuration and triggers battle screen mount.
   *
   * @author xhaziyh00
   * @param {Array<Array<Object>>} boardData - Populated 10x10 board matrix.
   * @param {Array<Object>} ships - List of configured ship entities.
   */

  const handleStartBattle = (boardData, ships) => {
    setPlayerBoardData(boardData);
    setPlayerShips(ships);
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
        <button type="button" onClick={retrySession}>Try again</button>
      </div>
    );
  }



  return(
    <Routes>
      <Route path="/" element={
        <MainPage
          onNavigateSettings={() => navigate("/settings")}
          onNavigateRules={() => navigate("/rules")}
          onNavigateStatistics={() => navigate("/statistics")}
          onStartGame={() => navigate("/ready")}
        /> } />
        <Route
          path="/lobby" element={<MainPage />} />
      <Route 
        path = "/lobby/create" element = {<MainPage />} />
      <Route
        path = "/lobby/join" element = {<MainPage />} />
      <Route
        path="/settings" element={<Settings onNavigateMain={() => navigate("/")} />} />
      <Route
        path="/rules" element={<Rules onNavigateMain={() => navigate("/")} />} />
      <Route
        path="/statistics" element={<StatisticsPage onHome={() => navigate("/")} />} />
      <Route
        path="/ready" element={<GetReady onGoHome={() => navigate("/")} onStartBattle={handleStartBattle} />} />
    </Routes>
  )
  // author:xhaziyh00 - Declarative client-side screen switcher
  /*
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
      return (
        <GetReady
          onGoHome={() => setScreen("menu")}
          onStartBattle={handleStartBattle}
        />
      );

    case "battle":
      return (
        <BattleshipGame
          onGoHome={() => setScreen("menu")}
          initialBoardData={playerBoardData}
          initialShips={playerShips}
        />
      );

    case "statistics":
      return (
        <StatisticsPage
          onHome={() => setScreen("menu")}
        />
      );

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
  */
}
export default App;
