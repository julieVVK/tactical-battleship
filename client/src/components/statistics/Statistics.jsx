// Import React hooks.
// useState stores the data and the current loading/error state.
// useEffect runs the request when the component is mounted.
import { useEffect, useState } from 'react';

// Import the CSS file responsible for the page's appearance.
// Keep this filename consistent with the actual CSS filename.
import './statistics.css';

// Convert an ISO date string from the backend into a readable date and time.
function formatDateTime(isoString) {
  const date = new Date(isoString);

  // Example: 21 Sept 2026
  const datePart = date.toLocaleDateString('en-GB', {
    timeZone: 'Europe/Prague',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  // Example: 18:42
  const timePart = date.toLocaleTimeString('en-GB', {
    timeZone: 'Europe/Prague',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Combine the date and time into one string.
  return `${datePart} · ${timePart}`;
}

export default function StatisticsPage({ onHome, onProfile }) {
  // stats will contain the data returned by the backend.
  // Initially, we do not have any statistics.
  const [stats, setStats] = useState(null);

  // loading tells React whether the request is still running.
  const [loading, setLoading] = useState(true);

  // error stores an error message if the request fails.
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

        // The backend requires a token from the user's session.
        // The token should have been saved during login/user creation.
        const token = localStorage.getItem('token');

        // If there is no token, we cannot make an authenticated request.
        if (!token) {
          throw new Error(
            'You are not signed in. Please sign in first.'
          );
        }

        // Request the first 10 matches and the overall statistics.
        // IMPORTANT: Your backend uses /api/statistics,
        // not /api/statistics/${userId}.
        const response = await fetch(
          'http://127.0.0.1:3000/api/statistics?offset=0&limit=10',
          {
            headers: {
              // Send the session token to the backend.
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // HTTP 401 means that the session token is missing or invalid.
        if (response.status === 401) {
          throw new Error(
            'Your session has expired. Please sign in again.'
          );
        }

        // Check whether the request was successful.
        if (!response.ok) {
          throw new Error('Failed to load statistics.');
        }

        // Convert the JSON response into a JavaScript object.
        const data = await response.json();

        // Update React state only if the component is still mounted.
        if (!cancelled) {
          setStats(data);
        }
      } catch (err) {
        // Display the error in the component instead of crashing the page.
        if (!cancelled) {
          setError(
            err.message || 'An unexpected error occurred.'
          );
        }
      } finally {
        // This runs whether the request succeeds or fails.
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    // Actually start the request.
    fetchStats();

    // Cleanup function: runs when the component is removed.
    return () => {
      cancelled = true;
    };
  }, []);

  // While waiting for the server, show a loading message.
  if (loading) {
    return (
      <div className="statistic-page">
        Loading statistics...
      </div>
    );
  }

  // If the request failed, show the error message.
  if (error) {
    return (
      <div className="statistic-page">
        Error: {error}
      </div>
    );
  }

  // Do not try to display statistics if there is no data.
  if (!stats) {
    return (
      <div className="statistic-page">
        No statistics available.
      </div>
    );
  }

  // Extract the properties returned by the backend.
  // The names must match the actual JSON response.
  const {
    battlesWon,
    battlesLost,
    battlesPlayed,
    winRate,
    recentMatches = [],
  } = stats;

  // Use the name totalGames inside the component to make
  // the JSX easier to read. The backend calls this battlesPlayed.
  const totalGames = battlesPlayed;

  // Calculate the percentage of won battles.
  // The condition prevents division by zero.
  const wonPercent = totalGames > 0
    ? Math.round((battlesWon / totalGames) * 100)
    : 0;

  // Calculate the percentage of lost battles.
  const lostPercent = totalGames > 0
    ? Math.round((battlesLost / totalGames) * 100)
    : 0;

  // Express the win ratio on a scale from 0 to 5.
  // For example, 48 wins out of 60 games gives 4 out of 5.
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

        {/* User/profile icon */}
        <button
          className="statistic-profile-button"
          type="button"
          aria-label="User profile"
          onClick={onProfile}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" />
          </svg>
        </button>
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
                style={{ width: `${wonPercent}%` }}
              />

              <div
                className="statistic-chart-lost"
                style={{ width: `${lostPercent}%` }}
              />
            </div>

            {/* Legend under the bar */}
            <div className="statistic-legend">

              <span className="statistic-legend-item">
                <span className="statistic-legend-dot statistic-legend-dot--victory" />
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
                <span className="statistic-legend-dot statistic-legend-dot--defeat" />
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

            // The API uses lowercase "victory" and "defeat".
            // Convert the result into a boolean for styling.
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

        <div className="statistic-footnote">
          Statistics from your match history
        </div>

      </div>
    </div>
  );
}