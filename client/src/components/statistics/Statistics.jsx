// File was created by Marie Pindorová (xpindom00) and Vladyslav Doroshenko (xdorosv00)
// Marie: HTML structure, styles, prepared backend communication here and on backend
// Vladyslav: fixed all backend communication - requestStats(), loadMoreMatches(), React Router

import {useEffect, useState} from 'react';
import {useLocation} from 'react-router';
import {useLanguage} from '../../i18n/useLanguage.js';
import ProfileMenu from '../profileMenu/ProfileMenu.jsx';
import Button from '../button/Button.jsx';
import './statistics.css';

// Convert an ISO date string from the backend
function formatDateTime(isoString, language) {
  const date = new Date(isoString);
  const locale = language === 'en' ? 'en-GB' : language;

  const datePart = date.toLocaleDateString(locale, {
    timeZone: 'Europe/Prague',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const timePart = date.toLocaleTimeString(locale, {
    timeZone: 'Europe/Prague',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${datePart} · ${timePart}`;
}

async function requestStats(offset = 0, limit = 10) {
  // Request a portion of match history and the overall statistics.
  const response = await fetch(
    `/api/statistics?offset=${offset}&limit=${limit}`
  );

  if (!response.ok) {
    throw new Error('Failed to load statistics.');
  }

  const data = await response.json();
  return data;
}

export default function StatisticsPage() {
  const {t, language} = useLanguage();
  const {hash} = useLocation();
  // stats will contain the data returned by the backend.
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  // Match history lives on this page and becomes available after loading.
  useEffect(() => {
    if (hash === '#match-history' && !loading) {
      document.getElementById('match-history')?.scrollIntoView();
    }
  }, [hash, loading]);

  // useEffect runs when this component appears on the page.
  useEffect(() => {
    // This flag prevents state updates if the component is removed
    // before the HTTP request finishes.
    let cancelled = false;

    // Define an asynchronous function that requests statistics.
    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);

        const data = await requestStats(0, 10);

        // Update React state only if the component is still mounted.
        if (!cancelled) {
          setStats(data);
        }
      } catch {
        if (!cancelled) {
          setError('stats.loadFailed');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchStats();

    return () => {
      cancelled = true;
    };
  }, []);

  async function loadMoreMatches() {
    setLoadingMore(true);
    setError(null);

    try {
      const offset = stats.recentMatches.length;
      const data = await requestStats(offset, 10);

      setStats(previouslyFetchedStats => ({
        ...data,
        recentMatches: [
          ...previouslyFetchedStats.recentMatches,
          ...data.recentMatches,
        ],
      }));
    } catch {
      setError('stats.loadFailed');
    } finally {
      setLoadingMore(false);
    }
  }

  const navigation = (
    <div className="statistic-navigation">
      <Button className="home-button" to="/">‹ {t('nav.home')}</Button>
      <ProfileMenu />
    </div>
  );

  if (loading) {
    return (
      <div className="statistic-page">
        {navigation}
        {t('stats.loading')}
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="statistic-page">
        {navigation}
        <p role="alert">{t(error)}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="statistic-page">
        {navigation}
        {t('stats.empty')}
      </div>
    );
  }


  const {
    battlesWon,
    battlesLost,
    battlesPlayed,
    winRate,
    recentMatches = [],
  } = stats;
  const totalGames = battlesPlayed;

  const wonPercent = totalGames > 0
    ? Math.round((battlesWon / totalGames) * 100)
    : 0;

  const lostPercent = totalGames > 0
    ? Math.round((battlesLost / totalGames) * 100)
    : 0;

  const ratioOutOf5 = totalGames > 0
    ? Math.round((battlesWon / totalGames) * 5)
    : 0;

  return (
    <div className="statistic-page">

      {/* Top navigation bar */}
      {navigation}

      {/* Page title */}
      <h1 className="statistic-title">{t('stats.title')}</h1>

      <p className="statistic-subtitle">
        {t('stats.subtitle')}
      </p>

      {/* Three summary cards */}
      <div className="statistic-cards">

        {/* Number of victories */}
        <div className="statistic-card">
          <div className="statistic-card-label">{t('stats.wins')}</div>
          <div className="statistic-card-value statistic-card-value--victory">{battlesWon}</div>
          <div className="statistic-card-description">{t('stats.winsDescription')}</div>
        </div>

        {/* Number of defeats */}
        <div className="statistic-card">
          <div className="statistic-card-label">{t('stats.losses')}</div>
          <div className="statistic-card-value statistic-card-value--defeat">{battlesLost}</div>
          <div className="statistic-card-description">
            {t('stats.lossesDescription')}
          </div>
        </div>

        {/* Win percentage */}
        <div className="statistic-card">
          <div className="statistic-card-label">{t('stats.rate')}</div>
          <div className="statistic-card-value statistic-card-value--win-rate">{winRate}%</div>
          <div className="statistic-card-description">
            {t('stats.rateSummary', {wins: battlesWon, total: totalGames})}
          </div>
        </div>
      </div>

      {/* Overall results section */}
      <div className="statistic-overall">

        <div className="statistic-overall-header">
          <h2 className="statistic-overall-title">{t('stats.overall')}</h2>
          <span className="statistic-played">
            {t('stats.played', {total: totalGames})}
          </span>
        </div>

        <div className="statistic-overall-body">

          {/* Victory ratio displayed as "4 out of 5" */}
          <div className="statistic-ratio">
            <div className="statistic-ratio-value">
              {t('stats.ratio', {count: ratioOutOf5})}
            </div>
            <div className="statistic-ratio-description">
              {t('stats.ratioDescription')}
            </div>
          </div>

          {/* Horizontal bar showing wins and losses */}
          <div className="statistic-chart">

            <div className="statistic-chart-track">
              {/* The width of each segment depends on the percentage */}
              <div
                className="statistic-chart-won"
                style={{width: `${wonPercent}%`}}
              />

              <div
                className="statistic-chart-lost"
                style={{width: `${lostPercent}%`}}
              />
            </div>

            {/* Legend under the bar */}
            <div className="statistic-legend">

              <span className="statistic-legend-item">
                <span className="statistic-legend-dot statistic-legend-dot--victory"/>
                {t('stats.wonLabel')}
              </span>

              <span className="statistic-legend-values">
                <span>
                  {battlesWon} · {wonPercent}%
                </span>
                <span>
                  {battlesLost} · {lostPercent}%
                </span>
              </span>

              <span className="statistic-legend-item">
                <span className="statistic-legend-dot statistic-legend-dot--defeat"/>
                {t('stats.lostLabel')}
              </span>

            </div>
          </div>
        </div>
      </div>

      {/* Recent matches section */}
      <div id="match-history" className="statistic-recent-matches">

        <div className="statistic-recent-header">
          <h2 className="statistic-recent-title">{t('stats.recent')}</h2>

          <span className="statistic-recent-description">
            {t('stats.recentSummary', {count: recentMatches.length})}
          </span>
        </div>

        {/* Table containing the match history */}
        <div className="statistic-matches-table">

          {/* Table headings */}
          <div className="statistic-match-row statistic-match-row--head">
            <div>{t('stats.date')}</div>
            <div>{t('stats.result')}</div>
            <div className="statistic-moves-heading">{t('stats.moves')}</div>
          </div>

          {/* Create one row for every match returned by the backend */}
          {recentMatches.map((match, index) => {
            const isVictory =
              match.result.toLowerCase() === 'victory';

            return (
              <div
                className="statistic-match-row"
                key={`${match.date}-${index}`}
              >

                {/* Match date and time */}
                <div className="statistic-match-date">
                  {formatDateTime(match.date, language)}
                </div>

                {/* Result badge: green for victory, red for defeat */}
                <div>
                  <span
                    className={`statistic-result ${
                      isVictory ? 'statistic-result--victory' : 'statistic-result--defeat'
                    }`}
                  >
                    {t(isVictory ? 'stats.victory' : 'stats.defeat')}
                  </span>
                </div>

                {/* Number of moves in the match */}
                <div className="statistic-match-moves">
                  {match.moves}
                </div>

              </div>
            );
          })}

        </div>

        {error &&
          <p role="alert" style={{"display": "flex",
          "margin": "15px",
          justifyContent: "center"}}>
            {t(error)}
          </p>
        }

        <Button
          className="statistic-load-more-button"
          onClick={loadMoreMatches}
          disabled={loadingMore || recentMatches.length >= battlesPlayed}
        >
          {t(loadingMore ? 'stats.loadingMore' : 'stats.loadMore')}
        </Button>

      </div>
    </div>
  );
}
