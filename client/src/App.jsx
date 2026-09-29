import MainPage from "./components/mainPage/MainPage.jsx";
import Settings from "./components/settings/settings.jsx";
import { useState } from "react";

function App() {

    const [currentPage, setCurrentPage] = useState("main");
    return (
        <>
            {currentPage === "main" && (<MainPage onNavigateSettings={() => setCurrentPage("settings")} />)}
            {currentPage === "settings" && (<Settings onNavigateMain={() => setCurrentPage("main")} />)}
        </>
    );
}

export default App;
