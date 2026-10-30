/* author: Marie Pindorová xpindom00 */

// Edited by Vladyslav Doroshenko
//     - Added foreign languages support

import { useLanguage } from '../../i18n/useLanguage.js';
import Button from '../button/Button.jsx';
import ProfileMenu from '../profileMenu/ProfileMenu.jsx';
import './rules.css';

export default function HowToPlay() {
  const { t } = useLanguage();
  return (
    <div className="htp-wrap">
      <div className="top-bar">
        <Button className="home-btn" to="/">‹ {t('nav.home')}</Button>
        <ProfileMenu />
      </div>

      <h1>{t('rules.title')}</h1>
      <p className="subtitle">{t('rules.subtitle')}</p>

      <div className="step-grid">
        <div className="step-card">
          <h2><span className="num">01</span> {t('game.yourFleet')}</h2>
          <p className="lead">{t('rules.fleetSummary')}</p>
          <div className="fleet-row">
            <div className="ship-group">
              <div className="ship-cells">
                <div className="ship-cell"></div>
                <div className="ship-cell"></div>
                <div className="ship-cell"></div>
                <div className="ship-cell"></div>
              </div>
              <span className="ship-label">{t('rules.fourCells')}</span>
            </div>

            <div className="ship-group">
              <div className="ship-cells">
                <div className="ship-cell"></div>
                <div className="ship-cell"></div>
                <div className="ship-cell"></div>
              </div>
              <span className="ship-label">{t('rules.threeCells')}</span>
            </div>

            <div className="ship-group">
              <div className="ship-cells">
                <div className="ship-cell"></div>
                <div className="ship-cell"></div>
              </div>
              <span className="ship-label">{t('rules.twoCells')}</span>
            </div>

            <div className="ship-group">
              <div className="ship-cells">
                <div className="ship-cell"></div>
              </div>
              <span className="ship-label">{t('rules.oneCell')}</span>
            </div>
          </div>
        </div>

        <div className="step-card">
          <h2><span className="num">02</span> {t('rules.placeTitle')}</h2>
          <p>{t('rules.placeDirection')}</p>
          <p>{t('rules.placeBounds')}</p>
          <p>{t('rules.hidden')}</p>
        </div>

        <div className="step-card">
          <h2><span className="num">03</span> {t('rules.shootTitle')}</h2>
          <p>{t('rules.chooseSquare')}</p>
          <p>{t('rules.hitMiss')}</p>
          <p>{t('rules.sunk')}</p>
          <div className="shot-legend">
            <span className="hit">{t('rules.hitLegend')}</span>
            <span className="miss">{t('rules.missLegend')}</span>
          </div>
        </div>

        <div className="step-card">
          <h2><span className="num">04</span> {t('rules.winTitle')}</h2>
          <p>{t('rules.ownBoard')}</p>
          <p>{t('rules.opponentBoard')}</p>
          <p className="win">{t('rules.win')}</p>
        </div>
      </div>

      <div className="info-banner">
        <h3>{t('rules.abilitiesTitle')}</h3>
        <p>{t('rules.abilities')}</p>
      </div>
    </div>
  );
}
