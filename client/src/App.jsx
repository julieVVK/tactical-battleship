import MainPage from "./components/mainPage/MainPage.jsx";
import Settings from "./components/settings/settings.jsx";
import Rules from "./components/rulesPage/rules.jsx";
import GetReady from "./components/battleshipGame/battleshipGetReady.jsx";
import BattleshipGame from "./components/battleshipGame/battleshipGame.jsx";
import { useState } from "react";

function App() {
  const [screen, setScreen] = useState("menu");

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
  *       sound and language will be stored in `const localStorage`.
  *       Add isDirty, savedProfile, draftProfile
  * */

  // author:xhaziyh00 - Declarative client-side screen switcher
  switch (screen) {
    case "menu":
      return (
        <MainPage
          onStartGame={() => setScreen("ready")}
          onNavigateSettings={() => setScreen("settings")}
          onNavigateRules={() => setScreen("rules")}
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

    default:
      // author:xhaziyh00 - Fallback to main menu if unknown screen state is passed
      return (
        <MainPage
          onStartGame={() => setScreen("ready")}
          onNavigateSettings={() => setScreen("settings")}
          onNavigateRules={() => setScreen("rules")}
        />
      );
  }
}
export default App;
