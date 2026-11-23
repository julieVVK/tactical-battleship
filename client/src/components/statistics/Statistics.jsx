// File was created by Marie Pindorová (xpindom00) and Vladyslav Doroshenko (xdorosv00)
// Marie: HTML structure, styles, prepared backend communication here and on backend
// Vladyslav: fixed all backend communication - requestStats(), loadMoreMatches(), React Router

import {useEffect, useState} from 'react';
import {useLocation} from 'react-router';
import {useLanguage} from '../../i18n/useLanguage.js';
import ProfileMenu from '../profileMenu/ProfileMenu.jsx';
import Button from '../button/Button.jsx';
import {DEMO_MATCH} from './demoMatch.js';
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

async function requestStats(userId, offset = 0, limit = 10) {
  // request a portion of match history and the overall statistics
  const response = await fetch(
    `/api/statistics?offset=${offset}&limit=${limit}`,
    {headers: {userId}}
  );

  if (!response.ok) {
    throw new Error('Failed to load statistics.');
  }

  const data = await response.json();
  return data;
}

/**
 * VIEW: send requests and reflect successful changes
 * @param {string} userId 
 * @param {string} gameId 
 * @param {json} changes the server's updated values
 * @returns 
 */
async function updateMatchHistory(userId, gameId, changes) {
  const response = await fetch(`/api/statistics/${gameId}`, {
    method: 'PATCH',
    headers: {'Content-Type': 'application/json', userId},
    body: JSON.stringify(changes),
  });

  if (!response.ok) {
    throw new Error('Failed to update match history.');
  }

  return response.json();
}

/**
 * send a DELETE request to the same URL with the player ID
 * @param {string} userId 
 * @param {string} gameId 
 */
async function deleteMatchFromHistory(userId, gameId) {
  const response = await fetch(`/api/statistics/${gameId}`, {
    method: 'DELETE',
    headers: {userId},
  });

  if (!response.ok) {
    throw new Error('Failed to delete match from history.');
  }
}

export default function StatisticsPage({userId}) {
  const {t, language} = useLanguage();
  const {hash} = useLocation();
  // stats will contain the data returned by the backend.
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [pendingMatchAction, setPendingMatchAction] = useState(null);
  const [noteDrafts, setNoteDrafts] = useState({});
  const [demoMatch, setDemoMatch] = useState(() => ({...DEMO_MATCH}));

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

        const data = await requestStats(userId, 0, 10);

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
  }, [userId]);

  async function loadMoreMatches() {
    setLoadingMore(true);
    setError(null);

    try {
      const offset = stats.recentMatches.length;
      const data = await requestStats(userId, offset, 10);

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

  
  // ask the server to save the opposite if the current favourite value
  async function toggleFavorite(match) {
    setPendingMatchAction(match.gameId);
    setError(null);

    try {
      if (match.isDemo) {
        setDemoMatch(previousMatch => previousMatch
          ? {...previousMatch, favorite: !previousMatch.favorite}
          : previousMatch);
        return;
      }

      const updatedMatch = await updateMatchHistory(userId, match.gameId, {
        favorite: !match.favorite,
      });

      // find the matching gameId and replace that row with a copy containing the returned favourite value
      setStats(previousStats => ({
        ...previousStats,
        recentMatches: previousStats.recentMatches.map(previousMatch =>
          previousMatch.gameId === match.gameId
            ? {...previousMatch, favorite: updatedMatch.favorite}
            : previousMatch
        ),
      }));
    } catch {
      setError('stats.updateFailed');
    } finally {
      // clear the pending-action state
      setPendingMatchAction(null);
    }
  }

  // note form
  async function saveMatchNote(event, match) {
    // stop the browser's normal form submission, which would reload the page
    event.preventDefault();
    setPendingMatchAction(match.gameId);
    setError(null);

    const note = noteDrafts[match.gameId] ?? match.note ?? '';

    try {
      if (match.isDemo) {
        setDemoMatch(previousMatch => previousMatch
          ? {...previousMatch, note: note.trim()}
          : previousMatch);
        setNoteDrafts(previousDrafts => ({
          ...previousDrafts,
          [match.gameId]: note.trim(),
        }));
        return;
      }

      // update the matching row in stats and synchronize the note draft with the server's returned value
      const updatedMatch = await updateMatchHistory(userId, match.gameId, {note});

      setStats(previousStats => ({
        ...previousStats,
        recentMatches: previousStats.recentMatches.map(previousMatch =>
          previousMatch.gameId === match.gameId
            ? {...previousMatch, note: updatedMatch.note}
            : previousMatch
        ),
      }));
      setNoteDrafts(previousDrafts => ({
        ...previousDrafts,
        [match.gameId]: updatedMatch.note,
      }));
    } catch {
      setError('stats.updateFailed');
    } finally {
      setPendingMatchAction(null);
    }
  }

  // delete button
  async function deleteMatch(match) {
    // ask for confirmation
    if (!window.confirm(t('stats.deleteConfirm'))) return;

    if (match.isDemo) {
      setDemoMatch(null);
      return;
    }

    setPendingMatchAction(match.gameId);
    setError(null);

    try {
      // remove the matching row from its recentMatches state
      await deleteMatchFromHistory(userId, match.gameId);

      // recalculate the visible summary - this makes the change visible immediately
      setStats(previousStats => {
        const battlesPlayed = previousStats.battlesPlayed - 1;
        const battlesWon = previousStats.battlesWon -
          (match.result === 'victory' ? 1 : 0);

        return {
          ...previousStats,
          battlesPlayed,
          battlesWon,
          battlesLost: previousStats.battlesLost -
            (match.result === 'defeat' ? 1 : 0),
          winRate: battlesPlayed > 0
            ? Math.round((battlesWon / battlesPlayed) * 100)
            : 0,
          recentMatches: previousStats.recentMatches.filter(
            previousMatch => previousMatch.gameId !== match.gameId
          ),
        };
      });
    } catch {
      setError('stats.deleteFailed');
    } finally {
      setPendingMatchAction(null);
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
  const displayedMatches = demoMatch
    ? [...recentMatches, demoMatch]
    : recentMatches;

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
          {displayedMatches.map(match => {
            const isVictory =
              match.result.toLowerCase() === 'victory';
            const isPending = pendingMatchAction === match.gameId;

            return (
              <div
                className="statistic-match-row"
                key={match.gameId}
              >

                {/* Match date and time */}
                <div className="statistic-match-date">
                  {formatDateTime(match.date, language)}
                  {match.isDemo && (
                    <span className="statistic-demo-badge">
                      {t('stats.demoMatch')}
                    </span>
                  )}
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

                <div className="statistic-match-actions">
                  <button
                    type="button"
                    className="statistic-match-action"
                    aria-pressed={match.favorite}
                    disabled={isPending || pendingMatchAction !== null}
                    onClick={() => toggleFavorite(match)}
                  >
                    {match.favorite ? '★' : '☆'}{' '}
                    {t(match.favorite ? 'stats.unfavorite' : 'stats.favorite')}
                  </button>

                  <form
                    className="statistic-match-note"
                    onSubmit={event => saveMatchNote(event, match)}
                  >
                    <label htmlFor={`match-note-${match.gameId}`}>
                      {t('stats.noteLabel')}
                    </label>
                    <textarea
                      id={`match-note-${match.gameId}`}
                      value={noteDrafts[match.gameId] ?? match.note ?? ''}
                      maxLength={500}
                      placeholder={t('stats.notePlaceholder')}
                      onChange={event => setNoteDrafts(previousDrafts => ({
                        ...previousDrafts,
                        [match.gameId]: event.target.value,
                      }))}
                    />
                    <button
                      type="submit"
                      className="statistic-match-action"
                      disabled={isPending || pendingMatchAction !== null}
                    >
                      {t('stats.saveNote')}
                    </button>
                  </form>

                  <button
                    type="button"
                    className="statistic-match-action statistic-match-action--delete"
                    disabled={isPending || pendingMatchAction !== null}
                    onClick={() => deleteMatch(match)}
                  >
                    {t('stats.deleteMatch')}
                  </button>
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
          disabled={loadingMore || pendingMatchAction !== null || recentMatches.length >= battlesPlayed}
        >
          {t(loadingMore ? 'stats.loadingMore' : 'stats.loadMore')}
        </Button>

      </div>
    </div>
  );
}
