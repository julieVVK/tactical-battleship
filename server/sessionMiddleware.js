// File was created by Vladyslav Doroshenko

import { getSession } from "./sessions.js"
import fail from "./error.js"


export default function requireSession(req, res, next) {
    const authorization = req.get("Authorization")
    const token = authorization?.match(/^Bearer\s+(\S+)$/i)?.[1]

    if (!token)
        fail("SESSION_NOT_FOUND", "Send a session token in the Authorization header.")

    const session = getSession(token)
    req.userId = session.userId
    req.sessionToken = token

    next()
}
