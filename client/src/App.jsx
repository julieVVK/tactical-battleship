/**
 * @file App.jsx
 * @description Root application router component. Coordinates the top-level application
 * state machine, handles navigation between game stages (Main Menu, Fleet Setup, Active Match),
 * and propagates player fleet layout matrices between setup and battlefield views.
 * @author xhaziyh00
 */
import MainPage from "./components/mainPage/MainPage.jsx";
import Settings from "./components/settings/settings.jsx";
import GetReady from "./components/battleshipGame/battleshipGetReady.jsx";
import BattleshipGame from "./components/battleshipGame/battleshipGame.jsx";
import { useState } from "react";
/**
 * Root App functional component.
 *
 * @author xhaziyh00
 * @returns {JSX.Element} The active view corresponding to current navigation state.
 */
function App() {
  // author:xhaziyh00 - Active screen view indicator ('menu' | 'settings' | 'ready' | 'battle')
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
        />
      );

    case "settings":
      return <Settings onNavigateMain={() => setScreen("menu")} />;

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
        />
      );
  }
}
export default App;
