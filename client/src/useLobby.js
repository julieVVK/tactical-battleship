// File was created by Vladyslav Doroshenko

import {useEffect, useRef, useState} from 'react'
import {useLocation} from 'react-router'
import {io} from 'socket.io-client'

import {createGame, getGameCode, joinGame} from './api.js'


const lobbyErrors = {
    INVALID_GAME_ID: "lobby.invalidCode",
    USER_NOT_FOUND: "lobby.userNotFound",
    GAME_NOT_FOUND: "lobby.notFound",
    PLAYER_ALREADY_JOINED: "lobby.alreadyJoined",
    GAME_JOIN_CLOSED: "lobby.joinClosed",
    GAME_FULL: "lobby.full",
    PLAYER_NOT_IN_GAME: "lobby.playerNotInGame",
}


// App owns the lobby so changing routes does not discard it or its connection.
export function useLobby(userId)
{
    const {pathname} = useLocation()
    const [game, setGame] = useState(null)
    const [socket, setSocket] = useState(null);
    const [pending, setPending] = useState(false)
    const [error, setError] = useState('')
    const [previousPathname, setPreviousPathname] = useState(pathname)
    const [connectionError, setConnectionError] = useState('')
    const requestPending = useRef(false)
    const gameId = game?.id

    if (previousPathname !== pathname)
    {
        setPreviousPathname(pathname)
        setError('')
    }

    useEffect(() => {
        if (!userId || !gameId) return let disposed = false
            const socket = io({
                auth: {userId},
                autoConnect: false,
                reconnection: false,
            })
            setSocket(socket);
        socket.on('game:state', view => {
            if (view.id === gameId) setGame(view)
        })

<<<<<<< HEAD
        socket.on(
            'connect',
            () => {socket.timeout(5000).emit(
                'game:subscribe', {gameId}, (error, result) => {
                    if (disposed) return if (error)
                        {
                            setConnectionError(
                                'Could not subscribe to lobby updates.')
                        }
                    else
                    {
                        setConnectionError(
                            result.ok ? '' : result.error.message)
                    }
                })})

        socket.on(
            'connect_error',
            error => {setConnectionError(
                error.data?.message ?? 'Could not connect to lobby updates.')})

        socket.on('disconnect', () => {setConnectionError('Connection lost.')})
=======
        socket.on("connect", () => {
            socket.timeout(5000).emit("game:subscribe", { gameId }, (error, result) => {
                if (disposed) return
                if (error) {
                    setConnectionError("lobby.subscribeFailed")
                } else {
                    setConnectionError(result.ok ? "" : lobbyErrors[result.error.code] ?? "lobby.subscribeFailed")
                }
            })
        })

        socket.on("connect_error", () => {
            setConnectionError("lobby.connectFailed")
        })

        socket.on("disconnect", () => {
            setConnectionError("lobby.connectionLost")
        })
>>>>>>> eae1e8cf9c6cbb369f66162dfd13cc5315f45821

        socket.connect()

        return () => {
            disposed = true
            socket.removeAllListeners()
            socket.disconnect()
            setSocket(null)
        }
    }, [userId, gameId])

    async function openLobby(code)
    {
        if (!userId || pending || requestPending.current) return null
            requestPending.current = true
            setPending(true)
            setError('')

            try
            {
                let view
                if (code === undefined)
                {
                    view = game ?? await createGame(userId)
                }
                else {const gameCode = getGameCode(code)
                view = game?.id === gameCode ? game : await joinGame(gameCode, userId)
            }
            setGame(view)
<<<<<<< HEAD
                return view
            }
            catch (error)
            {
                setError(error.message)
                return null
            }
            finally
            {
                requestPending.current = false
                setPending(false)
            }
=======
            return view
        } catch (error) {
            setError(lobbyErrors[error.code] ?? "lobby.openFailed")
            return null
        } finally {
            requestPending.current = false
            setPending(false)
        }
>>>>>>> eae1e8cf9c6cbb369f66162dfd13cc5315f45821
    }

    return
    {
        game, pending, error, connectionError, openLobby, socket
    }
}
