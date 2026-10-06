import MainPage from "./components/mainPage/MainPage.jsx";
import GetReady from "./components/battleshipGame/battleshipGetReady.jsx";
import BattleshipGame from "./components/battleshipGame/battleshipGame.jsx";
import { useState } from "react";
function App() {

  const [screen, setScreen] = useState("ready");

  // author:xhaziyh00 - Declarative client-side screen switcher
  switch (screen) {
    case "menu":
      return <MainPage onStartGame={() => setScreen("ready")} />;

    case "ready":
      return (
        <GetReady
          onGoHome={() => setScreen("menu")}
          onStartBattle={() => setScreen("battle")}
        />
      );

    case "battle":
      return <BattleshipGame onGoHome={() => setScreen("menu")} />;

    default:
      // author:xhaziyh00 - Fallback to main menu if unknown screen state is passed
      return <MainPage onStartGame={() => setScreen("ready")} />;
  }
}
export default App;
