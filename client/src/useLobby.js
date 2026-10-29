// File was created by Vladyslav Doroshenko

import { useEffect, useRef, useState } from "react"
import { useLocation } from "react-router"
import { io } from "socket.io-client"
import { createGame, getGameCode, joinGame } from "./api.js"

// App owns the lobby so changing routes does not discard it or its connection.
export function useLobby(sessionReady) {
    const { pathname } = useLocation()
    const [game, setGame] = useState(null)
    const [pending, setPending] = useState(false)
    const [error, setError] = useState("")
    const [previousPathname, setPreviousPathname] = useState(pathname)
    const [connectionError, setConnectionError] = useState("")
    const requestPending = useRef(false)
    const gameId = game?.id

    if (previousPathname !== pathname) {
        setPreviousPathname(pathname)
        setError("")
    }

    useEffect(() => {
        if (!sessionReady || !gameId) return
        let disposed = false
        const socket = io({
            auth: { token: localStorage.getItem("token") },
            autoConnect: false,
            reconnection: false,
        })

        socket.on("game:state", view => {
            if (view.id === gameId) setGame(view)
        })

        socket.on("connect", () => {
            socket.timeout(5000).emit("game:subscribe", { gameId }, (error, result) => {
                if (disposed) return
                if (error) {
                    setConnectionError("Could not subscribe to lobby updates.")
                } else {
                    setConnectionError(result.ok ? "" : result.error.message)
                }
            })
        })

        socket.on("connect_error", error => {
            setConnectionError(error.data?.message ?? "Could not connect to lobby updates.")
        })

        socket.on("disconnect", () => {
            setConnectionError("Connection lost.")
        })

        socket.connect()

        return () => {
            disposed = true
            socket.removeAllListeners()
            socket.disconnect()
        }
    }, [sessionReady, gameId])

    async function openLobby(code) {
        if (!sessionReady || pending || requestPending.current) return null
        requestPending.current = true
        setPending(true)
        setError("")

        try {
            let view
            if (code === undefined) {
                view = game ?? await createGame()
            } else {
                const gameCode = getGameCode(code)
                view = game?.id === gameCode ? game : await joinGame(gameCode)
            }
            setGame(view)
            return view
        } catch (error) {
            setError(error.message)
            return null
        } finally {
            requestPending.current = false
            setPending(false)
        }
    }

    return { game, pending, error, connectionError, openLobby }
}
