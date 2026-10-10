async function request(path, options = {}) {
    const response = await fetch(`/api${path}`, options);
    const data = await response.json().catch(() => {
        throw new Error("The server returned an invalid response. Try again.");
    });

    if (!response.ok) {
        const error = new Error(data.error?.message || "The request failed. Try again.");
        error.code = data.error?.code;
        throw error;
    }

    return data;
}

async function createGuestSession() {
    const userId = crypto.randomUUID();
    const user = await request("/createUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, userName: `Guest ${userId.slice(0, 4)}` }),
    });
    localStorage.setItem("token", user.token);
    return user.token;
}

async function lobbyRequest(path) {
    let token = localStorage.getItem("token") || await createGuestSession();

    try {
        return await request(path, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
        });
    } catch (error) {
        if (error.code !== "SESSION_NOT_FOUND") throw error;

        localStorage.removeItem("token");
        localStorage.removeItem("gameId");
        token = await createGuestSession();
        return request(path, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
        });
    }
}

export function parseLobbyCode(input) {
    let code = input.trim();

    if (/^https?:\/\//i.test(code)) {
        const link = new URL(code);
        code = link.searchParams.get("gameId") || link.pathname.split("/").filter(Boolean).pop() || "";
    }

    if (!/^[a-f0-9]{6}$/i.test(code)) {
        throw new Error("Enter a six-character lobby code, for example ABC123.");
    }

    return code.toUpperCase();
}

export async function createLobby() {
    const game = await lobbyRequest("/createGames");
    localStorage.setItem("gameId", game.id);
    return game;
}

export async function joinLobby(input) {
    const gameId = parseLobbyCode(input);
    const game = await lobbyRequest(`/games/${gameId}/join`);
    localStorage.setItem("gameId", game.id);
    return game;
}
