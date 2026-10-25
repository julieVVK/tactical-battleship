// HTTP sends actions. Socket.IO supplies the updated game to both players.
async function request(path, method = "GET", body) {
    const token = localStorage.getItem("token");
    const response = await fetch("/api" + path, {
        method,
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) {
        const error = new Error(data.error.message);
        error.code = data.error.code;
        throw error;
    }

    return data;
}

export function createLobby() {
    return request("/createGames", "POST");
}

export function createComputerGame() {
    return request("/createRobotGame", "POST");
}

export function joinLobby(code) {
    const gameId = encodeURIComponent(code.trim().toUpperCase());
    return request(`/games/${gameId}/join`, "POST");
}

export function getGame(gameId) {
    return request(`/games/${encodeURIComponent(gameId)}`);
}

export function readyPlayer(gameId, board) {
    return request(`/games/${gameId}/ready`, "POST", { board });
}

export function cancelReady(gameId) {
    return request(`/games/${gameId}/unready`, "POST");
}

export function fireShot(gameId, row, col) {
    return request(`/games/${gameId}/shots`, "POST", { row, col });
}

export function activateGadget(gameId, gadget, row, col, shipId, vertical) {
    return request(`/games/${gameId}/gadgets/${gadget}`, "POST", {
        row,
        col,
        shipId,
        vertical,
    });
}

export function leaveGame(gameId) {
    return request(`/games/${gameId}/leave`, "POST");
}
