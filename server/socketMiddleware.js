// File was created by Vladyslav Doroshenko

import { getSession } from "./sessions.js"
import { decodeError } from "./errorHandler.js"


export default function requireSocketSession(socket, next) {
    try {
        const token = socket.handshake.auth?.token
        const session = getSession(token)

        socket.data.userId = session.userId
        socket.data.sessionToken = token

        next()
    } catch (error) {
        const { code, message } = decodeError(error)
        const connectionError = new Error(message)
        connectionError.data = { code, message }

        next(connectionError)
    }
}
