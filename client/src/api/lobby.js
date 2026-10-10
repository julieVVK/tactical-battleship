// File was created by Vladyslav Doroshenko

import request from "./request.js";
import { clearSession, ensureSession, getSessionToken } from "./session.js";

async function lobbyRequest(path) {
    let token = await ensureSession();

    try {
        return await request(path, { method: "POST", token });
    } catch (error) {
        if (error.code !== "SESSION_NOT_FOUND") throw error;

        clearSession();
        token = await ensureSession();
        return request(path, { method: "POST", token });
    }
}

export function parseLobbyCode(input) {
    let code = input.trim();

    if (/^https?:\/\//i.test(code)) {
        let link;
        try {
            link = new URL(code);
        } catch {
            throw new Error("Enter a valid lobby link or a six-character code.");
        }
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

export async function getLobby(gameId, options = {}) {
    const token = getSessionToken();
    if (!token) {
        const error = new Error("Your session expired. Create or join a lobby again.");
        error.code = "SESSION_NOT_FOUND";
        throw error;
    }
    return request(`/games/${encodeURIComponent(gameId)}`, { ...options, token });
}
