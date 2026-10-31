/* @authors:
    Yuliia Vovk: React Router
    Haziy Hosha: player board data passing
    Vladyslav Doroshenko: React Router
*/

import MainPage from "./components/mainPage/MainPage.jsx"
import Settings from "./components/settings/Settings.jsx"
import Rules from "./components/rulesPage/Rules.jsx"
import GetReady from "./components/battleshipGame/BattleshipGetReady.jsx"
import BattleshipGame from "./components/battleshipGame/BattleshipGame.jsx"
import StatisticsPage from "./components/statistics/Statistics.jsx"
import {useEffect, useState} from "react"
import {initializeUser} from "./user.js"
import {Navigate, Routes, Route, useNavigate} from "react-router"
import {useLobby} from "./useLobby.js"
import {useLanguage} from "./i18n/useLanguage.js"

function App() {
    const {t} = useLanguage()
    const navigate = useNavigate()
    const [user, setUser] = useState({status: "loading", error: null})
    const lobby = useLobby(user.id)


    // author: Vladyslav Doroshenko
    // Create random user
    useEffect(() => {
        if (user.status !== "loading")
            return

        // Ignore this effect's result after cleanup. The request itself still runs.
        let cancelled = false

        initializeUser().then((guest) => {

            if (cancelled) return
            setUser({status: "ready", error: null, id: guest.id})

        }, (error) => {

            if (cancelled) return
            setUser({status: "error", error: error.message})

        })

        return () => {
            cancelled = true
        }

    }, [user.status])


    function retryUser() {
        setUser({status: "loading", error: null})
    }


    // author:xhaziyh00 - Persisted 10x10 player board matrix with placed fleet coordinates
    const [playerBoardData, setPlayerBoardData] = useState(null)
    const [playerShips, setPlayerShips] = useState(null)
    const [robotGame, setRobotGame] = useState(null)
    const [robotFleet, setRobotFleet] = useState(null)
    const [gameError, setGameError] = useState(null)

    const handleStartBattle = (boardData, ships) => {
        setPlayerBoardData(boardData)
        setPlayerShips(ships)
        navigate("/game")
    }

    async function handlePlayWithPC() {
        setGameError(null)
        try {
            const response = await fetch("/api/createRobotGame", {
                method: "POST",
                headers: { userId: user.id },
            })
            const view = await response.json()
            if (!response.ok) {
                throw new Error(view.error?.message || "Could not create a robot game.")
            }
            setRobotGame(view)
            setRobotFleet(null)
            navigate("/robot/ready")
        } catch (error) {
            setGameError(error.message)
        }
    }

    async function handleStartRobotBattle(boardData, ships) {
        setGameError(null)
        try {
            const board = boardData.map(row => row.map(cell => cell.hasShip ? String(cell.shipId) : null))
            const response = await fetch(`/api/games/${robotGame.id}/ready`, {
                method: "POST",
                headers: { userId: user.id, "Content-Type": "application/json" },
                body: JSON.stringify({ board }),
            })
            const view = await response.json()
            if (!response.ok) {
                throw new Error(view.error?.message || "Could not submit your fleet.")
            }
            setRobotGame(view)
            setRobotFleet({ boardData, ships })
            navigate("/robot/game")
        } catch (error) {
            setGameError(error.message)
        }
    }


    /*TODO: Fix state reset due to component re-mounting via handling saved settings through props
    *       sound settings still need persistence.
    *  EDIT: cancell saving settings, nobody gives a fuck
    *        could have done it through local storage or cookies
    * */


    // author: Vladyslav Doroshenko
    if (user.status === "loading") {
        return <p role="status">{t("connection.loading")}</p>
    }
    if (user.status === "error") {
        return (
            <div role="alert">
                <p>{t(user.error)}</p>
                <button type="button" onClick={retryUser}>{t("connection.retry")}</button>
            </div>
        )
    }


    const menu = <MainPage lobby={lobby} onPlayWithPC={handlePlayWithPC} gameError={gameError}/>


    return (
        <Routes>
            <Route path="/" element={menu}/>
            <Route path="/lobby" element={menu}/>
            <Route path="/lobby/create" element={menu}/>
            <Route path="/lobby/join" element={menu}/>
            <Route path="/settings" element={<Settings/>}/>
            <Route path="/rules" element={<Rules/>}/>
            <Route path="/statistics" element={<StatisticsPage/>}/>
            <Route path="/ready" element={
                                     lobby.game?.players.opponent ?
                                             <GetReady onStartBattle={handleStartBattle}/> :
                                             <Navigate to="/lobby" replace/>
                                 }/>
            <Route path="/game" element={
                                    playerBoardData ?
                                        <BattleshipGame initialBoardData={playerBoardData} initialShips={playerShips}/> :
                                        <Navigate to="/ready" replace/>
                                }/>
            <Route path="/robot/ready" element={
                robotGame ?
                    robotFleet ?
                        <Navigate to="/robot/game" replace/> :
                        <GetReady onStartBattle={handleStartRobotBattle} gameError={gameError}/> :
                    <Navigate to="/" replace/>
            }/>
            <Route path="/robot/game" element={
                robotGame && robotFleet ?
                    <BattleshipGame
                        key={robotGame.id}
                        initialBoardData={robotFleet.boardData}
                        initialShips={robotFleet.ships}
                        initialGameView={robotGame}
                        onGameViewChange={setRobotGame}
                        gameId={robotGame.id}
                        userId={user.id}
                    /> :
                    <Navigate to="/robot/ready" replace/>
            }/>
            <Route path="*" element={<Navigate to="/" replace/>}/>
        </Routes>
    )
}

export default App
