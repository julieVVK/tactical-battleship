// File was created by Vladyslav Doroshenko

import { getUser } from './users.js'
import { randomBytes } from "node:crypto";
import fail from "./error.js"


const sessions = new Map()


export function createSession(userId) {
    const user = getUser(userId)
    if (!user)
        fail("USER_NOT_FOUND", "User not found.")

    let token
    do {
        token = randomBytes(32).toString('hex')
    } while (sessions.has(token))

    sessions.set(token, { userId })
    return { token, userId }
}


export function getSession(token) {
    const session = sessions.get(token)
    if (!session)
        fail("SESSION_NOT_FOUND", "Session not found.")

    return { ...session }
}


export function removeSession(token) {
    if (!sessions.has(token))
        fail("SESSION_NOT_FOUND", "Session not found.")

    return sessions.delete(token)
}
