// File was created by Vladyslav Doroshenko

import Ship from "../ship/Ship.jsx";
import ProfileMenu from "../profileMenu/ProfileMenu.jsx";
import Button from "../button/Button.jsx";
import "./mainPage.css";
function MainPage({ onNavigateSettings, onStartGame }) {

    return (
        <>
            <div className="main-page">
                <Ship />
                <ProfileMenu />
                <div className="main-page-content">
                    <h1 className="main-page-title">Battleships</h1>
                    <div className="main-page-dialogue">
                        <h2 className="mainPageh1">Play</h2>
                        <div className="main-page-button-container">
                            <Button variant="light">With PC</Button>
                            <Button variant="dark" onClick={onStartGame}>2 Players</Button>
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "row", gap: "0.5rem"}}>
                        <Button className="main-page-rules">Rules</Button>
                        <Button className="main-page-rules" variant="light" onClick={onNavigateSettings}>Settings</Button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default MainPage
