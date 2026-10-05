// File was created by Vladyslav Doroshenko

import requireSocketSession from "./socketMiddleware.js"
import { getGameForPlayer } from "./games.js"
import { decodeError } from "./errorHandler.js"



export default function socketHandlers(io) {
    io.use(requireSocketSession)

    io.on("connection", (socket) => {
        console.log(`User with id "${socket.data.userId}" connected`)

        socket.on("game:subscribe", (payload, acknowledge) => {
            try {
                const view = getGameForPlayer(payload?.gameId, socket.data.userId)

                // Replace this socket's subscription only after a successful check.
                socket.data.gameId = view.id
                socket.emit("game:state", view)

                if (typeof acknowledge === "function")
                    acknowledge({ ok: true, gameId: view.id })
            } catch (error) {
                const { status, code, message } = decodeError(error)
                if (status === 500) console.error(error)

                if (typeof acknowledge === "function")
                    acknowledge({ ok: false, error: { code, message } })
                else
                    socket.emit("game:error", { code, message })
            }
        })

        socket.on("ping", (msg) => {
            console.log("new message: " + msg)
            socket.emit("pong", "pong")
        })

        socket.on("disconnect", (reason, description) => {
            console.log(`User disconnected:
        reason: ${reason},
        description: ${description}`)
        })
    })
}
