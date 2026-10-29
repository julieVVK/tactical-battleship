/*
File was created by Yuliia Vovk

api.js will be the place where your frontend sends game requests to the backend.

Each request needs to:

1. Read the token saved by session.js.
2. Attach it to the Authorization header.
3. Convert any request body into JSON.
4. Check whether the server accepted the request.
5. Return the response data or throw an error.

*/

async function request(path, { method = "GET", body } = {}) {
    const token = localStorage.getItem('token')
    if (!token) {
        throw new Error('No token found.')}
    const headers = { Authorization: `Bearer ${token}` }

    if (body !== undefined) {
        headers['Content-Type'] = 'application/json'
    }

    const response = await fetch(`/api${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined
    })

    const data = response.status === 204 ? null : await response.json()
    if (!response.ok) {
        const error = new Error(data?.error?.message ?? `Request failed with status ${response.status}`)
        error.status = response.status
        error.code = data?.error?.code
        error.data = data
        throw error
    }
    return data
}

// author: Vladyslav Doroshenko
export function getGameCode(value) {
    let code = value.trim()

    // - ^          means start of the string
    // - http       means just http text
    // - s?         means that s can but must not be there
    // - \/\/       two '/' symbols
    // - i          case insensitive
    // .test(code)  returns true or false whether a string passed regex or not
    if (/^https?:\/\//i.test(code)) {
        // extract code from th url string we got
        code = new URL(code).searchParams.get("code") ?? ""
    }

    if (!/^[a-f0-9]{6}$/i.test(code)) {
        throw new Error("Enter a six-character game code or a lobby invitation link.")
    }
    return code.toUpperCase()
}

export function createGame() {
    return request("/createGames", {
        method: "POST",
    })
}

export function joinGame(gameId) {
    return request(`/games/${gameId}/join`, {
        method: "POST",
    })
}

export function getGame(gameId) {
    const code = getGameCode(gameId)

    return request(`/games/${code}`)
}

export function unreadyGame(gameId) {
    const code = getGameCode(gameId)

    return request(`/games/${code}/unready`, {
        method: "POST",
    })
}
