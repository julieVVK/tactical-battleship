// File was created by Vladyslav Doroshenko

import { useLanguage } from '../../i18n/useLanguage.js';
import Ship from "../ship/Ship.jsx";
import ProfileMenu from "../profileMenu/ProfileMenu.jsx";
import Button from "../button/Button.jsx";
import "./mainPage.css";

function MainPage({ onNavigateSettings, onNavigateRules, onStartGame, onNavigateStatistics, onPlayWithPC, gameError }) {

    const { t } = useLanguage();

    return (
        <>
            <div className="main-page">
                <Ship />
                <ProfileMenu 
                    onNavigateStatistics={onNavigateStatistics}
                />
                <div className="main-page-content">
                    <h1 className="main-page-title">{t('app.title')}</h1>
                    {gameError && <p role="alert">{gameError}</p>}
                    <div className="main-page-dialogue">
                        <h2 className="mainPageh1">{t('menu.play')}</h2>
                        <div className="main-page-button-container">
                            <Button variant="light" onClick={onPlayWithPC}>{t('menu.computer')}</Button>
                            <Button variant="dark" onClick={onStartGame}>{t('menu.twoPlayers')}</Button>
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "row", gap: "0.5rem"}}>
                        <Button className="main-page-rules" onClick={onNavigateRules}>{t('nav.rules')}</Button>
                        <Button className="main-page-rules" variant="light" onClick={onNavigateSettings}>{t('nav.settings')}</Button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default MainPage
