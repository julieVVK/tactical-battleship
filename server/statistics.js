// this file was created by Marie Pindorová

import {getGames} from "./games.js"

/**
 *
 * @param {string} userId - a user's ID
 * @param {number} offset - how many matches to skip first
 * @param {number} limit - how many matches to return
 * @returns {object} - user's statistics
 */
export const getStatistics = (userId, offset = 0, limit = 10) => {
    // find a player's completed matches
    const recentMatches = getGames()
        // keep only games that have finished, have a finish timestamp and include the requested user as a player
        .filter(game =>
            game.phase === "finished" &&
            game.finishedAt &&
            game.players.some(player => player.id === userId))
        // filter out matches the player deleted
        .filter(game => {
            const player = game.players.find(player => player.id === userId)
            return !player.matchHistory.deleted
        })

        // for each matching game find the player's own game record that contains their shots
        .map(game => {
            const player = game.players.find(player => player.id === userId)

            // create an object for the statistics response
            return {
                gameId: game.id,
                date: game.finishedAt,
                result: game.winnerPlayerId === userId ? "victory" : "defeat",
                moves: player.shots.length, // number of player's shots
                favorite: player.matchHistory.favorite,
                note: player.matchHistory.note,
            }
        })

        // sort entries by the parsed date, newest first (positive or negative number tells JS which entry should come first)
        .sort((first, second) => Date.parse(second.date) - Date.parse(first.date))

    // total number of completed matches
    const battlesPlayed = recentMatches.length
    // total number of victories
    const battlesWon = recentMatches.filter(match => match.result === "victory").length
    // total number of defeats
    const battlesLost = battlesPlayed - battlesWon

    const winRate = battlesPlayed > 0
        ? Math.round((battlesWon / battlesPlayed) * 100)
        : 0
        
    return {
        battlesWon,
        battlesLost,
        battlesPlayed,
        winRate,
        recentMatches: recentMatches.slice(offset, offset + limit),
    }
}
