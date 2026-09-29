import MainPage from "./components/mainPage/MainPage.jsx";
import BattleshipGame from "./components/battleshipGame/battleshipGame.jsx";
import { useState } from "react";
function App() {
  const [screen, setScreen] = useState("menu");

  // author:xhaziyh00 - Screen routing & State Lifting mechanism:
  // 1. Conditional Rendering: Acts as a lightweight client-side router without React Router.
  //    If 'screen' equals 'menu', unmount the match view and render the main lobby (MainPage).
  // 2. State Lifting & Callback passing:
  //    Passes an inline callback (onGoHome) down to BattleshipGame (and further to Header).
  //    When triggered, it updates the root 'screen' state to 'menu', forcing App to re-render
  //    and display MainPage instantly.
  if (screen === "menu") return <MainPage />;
  return <BattleshipGame onGoHome={() => setScreen("menu")} />;
}
export default App;
