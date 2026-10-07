import MainPage from "./components/mainPage/MainPage.jsx";
import Settings from "./components/settings/settings.jsx";
import { useState } from "react";

function App() {

    const [currentPage, setCurrentPage] = useState("main");

    //TODO: Implement React Router
    /*TODO: Fix state reset due to component re-mounting via handling saved settings through props
    *       sound and language will be stored in `const localStorage`.
    *       Add isDirty, savedProfile, draftProfile
    * */
    return (
        <>
            {currentPage === "main" && (<MainPage onNavigateSettings={() => setCurrentPage("settings")} />)}
            {currentPage === "settings" && (<Settings onNavigateMain={() => setCurrentPage("main")} />)}
        </>
    );
}

export default App;
