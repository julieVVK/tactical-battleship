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

function App() {
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

    const handleStartBattle = (boardData) => {
        setPlayerBoardData(boardData)
        navigate("/game")
    }


    /*TODO: Fix state reset due to component re-mounting via handling saved settings through props
    *       sound settings still need persistence.
    *  EDIT: cancell saving settings, nobody gives a fuck
    *        could have done it through local storage or cookies
    * */


    // author: Vladyslav Doroshenko
    if (user.status === "loading") {
        return <p role="status">Connecting to the server...</p>
    }
    if (user.status === "error") {
        return (
            <div role="alert">
                <p>{user.error}</p>
                <button type="button" onClick={retryUser}>Try again</button>
            </div>
        )
    }


    const menu = <MainPage lobby={lobby}/>


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
                                        <BattleshipGame initialBoardData={playerBoardData}/> :
                                        <Navigate to="/ready" replace/>
                                }/>
            <Route path="*" element={<Navigate to="/" replace/>}/>
        </Routes>
    )
}

export default App
