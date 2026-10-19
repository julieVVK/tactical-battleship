// File was created by Marie Pindorová (xpindom00) and Vladyslav Doroshenko (xdorosv00)
// Marie: HTML structure, styles, prepared backend communication here and on backend
// Vladyslav: fixed all backend communication - requestStats(), loadMoreMatches()

import {useEffect, useState} from 'react';
import ProfileMenu from '../profileMenu/ProfileMenu.jsx';
import Button from '../button/Button.jsx';
import './statistics.css';

// Convert an ISO date string from the backend
function formatDateTime(isoString) {
  const date = new Date(isoString);

  const datePart = date.toLocaleDateString('en-GB', {
    timeZone: 'Europe/Prague',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const timePart = date.toLocaleTimeString('en-GB', {
    timeZone: 'Europe/Prague',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${datePart} · ${timePart}`;
}

async function requestStats(offset = 0, limit = 10) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No session found. Please reload the page.');
  }

  // Request a portion of match history and the overall statistics.
  const response = await fetch(
    `/api/statistics?offset=${offset}&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (response.status === 401) {
    throw new Error(
      'Your session has expired. Please reload the page.'
    );
  }

  if (!response.ok) {
    throw new Error('Failed to load statistics.');
  }

  const data = await response.json();
  return data;
}

export default function StatisticsPage({onHome}) {
  // stats will contain the data returned by the backend.
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

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
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || 'An unexpected error occurred.'
          );
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
    } catch (error) {
      setError(error.message);
    } finally {
      setLoadingMore(false);
    }
  }

  if (loading) {
    return (
      <div className="statistic-page">
        Loading statistics...
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="statistic-page">
        <div className="statistic-navigation">
          <Button className="statistic-home-button" onClick={onHome}>
            Home
          </Button>
        </div>
        <p role="alert">Error: {error}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="statistic-page">
        No statistics available.
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
      <div className="statistic-navigation">

        {/* Go back to the previous browser history entry */}
        <button
          className="statistic-home-button"
          type="button"
          onClick={onHome}
        >
          ‹ Home
        </button>

        <ProfileMenu />
      </div>

      {/* Page title */}
      <h1 className="statistic-title">Your statistics</h1>

      <p className="statistic-subtitle">
        Every battle counts. Here is how your fleet is doing.
      </p>

      {/* Three summary cards */}
      <div className="statistic-cards">

        {/* Number of victories */}
        <div className="statistic-card">
          <div className="statistic-card-label">Battles won</div>
          <div className="statistic-card-value statistic-card-value--victory">{battlesWon}</div>
          <div className="statistic-card-description">Enemy fleets defeated</div>
        </div>

        {/* Number of defeats */}
        <div className="statistic-card">
          <div className="statistic-card-label">Battles lost</div>
          <div className="statistic-card-value statistic-card-value--defeat">{battlesLost}</div>
          <div className="statistic-card-description">
            A chance to try a new strategy
          </div>
        </div>

        {/* Win percentage */}
        <div className="statistic-card">
          <div className="statistic-card-label">Win rate</div>
          <div className="statistic-card-value statistic-card-value--win-rate">{winRate}%</div>
          <div className="statistic-card-description">
            {battlesWon} wins out of {totalGames} battles
          </div>
        </div>
      </div>

      {/* Overall results section */}
      <div className="statistic-overall">

        <div className="statistic-overall-header">
          <h2 className="statistic-overall-title">Overall results</h2>
          <span className="statistic-played">
            {totalGames} battles played
          </span>
        </div>

        <div className="statistic-overall-body">

          {/* Victory ratio displayed as "4 out of 5" */}
          <div className="statistic-ratio">
            <div className="statistic-ratio-value">
              {ratioOutOf5} out of 5
            </div>
            <div className="statistic-ratio-description">
              battles end in a victory
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
                Won
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
                Lost
              </span>

            </div>
          </div>
        </div>
      </div>

      {/* Recent matches section */}
      <div className="statistic-recent-matches">

        <div className="statistic-recent-header">
          <h2 className="statistic-recent-title">Recent matches</h2>

          <span className="statistic-recent-description">
            Last {recentMatches.length} matches · Newest first
          </span>
        </div>

        {/* Table containing the match history */}
        <div className="statistic-matches-table">

          {/* Table headings */}
          <div className="statistic-match-row statistic-match-row--head">
            <div>DATE</div>
            <div>RESULT</div>
            <div className="statistic-moves-heading">MOVES</div>
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
                  {formatDateTime(match.date)}
                </div>

                {/* Result badge: green for victory, red for defeat */}
                <div>
                  <span
                    className={`statistic-result ${
                      isVictory ? 'statistic-result--victory' : 'statistic-result--defeat'
                    }`}
                  >
                    {isVictory ? 'Victory' : 'Defeat'}
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
            {error}
          </p>
        }

        <Button
          className="statistic-load-more-button"
          onClick={loadMoreMatches}
          disabled={loadingMore || recentMatches.length >= battlesPlayed}
        >
          {loadingMore ? 'Loading...' : 'Load more matches'}
        </Button>

      </div>
    </div>
  );
}