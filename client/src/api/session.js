import request from "./request.js";

export const getSessionToken = () => localStorage.getItem("token");
export const clearStoredGame = () => localStorage.removeItem("gameId");

export function clearSession() {
    localStorage.removeItem("token");
    clearStoredGame();
}

let pendingSession = null;

export async function ensureSession() {
    if (!pendingSession) {
        pendingSession = initializeSession().finally(() => {
            pendingSession = null;
        });
    }

    return pendingSession;
}

async function initializeSession() {
    const token = getSessionToken();
    if (token) {
        try {
            await request("/session", { token });
            return token;
        } catch (error) {
            if (error.code !== "SESSION_NOT_FOUND") throw error;
            clearSession();
        }
    }

    const userId = crypto.randomUUID();
    const user = await request("/createUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, userName: `Guest ${userId.slice(0, 4)}` }),
    });
    localStorage.setItem("token", user.token);
    return user.token;
}

export async function signOutSession() {
    const token = getSessionToken();
    if (token) {
        try {
            await request("/signout", { token });
        } catch (error) {
            if (error.code !== "SESSION_NOT_FOUND") throw error;
        }
    }
    clearSession();
}
