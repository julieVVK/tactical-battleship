/*
api.js will be the place where your frontend sends game requests to the backend.

Each request needs to:

1. Read the token saved by session.js.
2. Attach it to the Authorization header.
3. Convert any request body into JSON.
4. Check whether the server accepted the request.
5. Return the response data or throw an error.

*/

async function request(path, options = {method: 'GET', body}) {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No token found.');}
    const headers = { Authorization: `Bearer ${token}` };
    if (body != undefined) {
        headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(body);
    }
    const response = await fetch('/api${path}', {
        method,
        headers,
        body: body != undefined ? JSON.stringify(body) : undefined
    });
    const data = response.status === 204 ? null : await response.json();
    if (!response.ok) {
        const error = new Error(`Request failed with status ${response.status}`);
        error.status = response.status;
        error.code = response.status;
        error.data = data;
        throw error;
    }
    return data;
}

export function createGame() {
    return request("/createGames", {
        method: "POST",
    });
}

export function joinGame(gameId) {
    const code = encodeURIComponent(gameId.trim().toUpperCase());

    return request(`/games/${code}/join`, {
        method: "POST",
    });
}

export function getGame(gameId) {
    const code = encodeURIComponent(gameId.trim().toUpperCase());

    return request(`/games/${code}`);
}

export function unreadyGame(gameId) {
    const code = encodeURIComponent(gameId.trim().toUpperCase());

    return request(`/games/${code}/unready`, {
        method: "POST",
    });
}
