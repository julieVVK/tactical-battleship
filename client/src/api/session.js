import request from "./request.js";

export const getSessionToken = () => localStorage.getItem("token");
export const clearStoredGame = () => localStorage.removeItem("gameId");

export function clearSession() {
    localStorage.removeItem("token");
    clearStoredGame();
}

let creatingSession = null;

export async function ensureSession() {
    const token = getSessionToken();
    if (token) return token;

    if (!creatingSession) {
        const userId = crypto.randomUUID();
        creatingSession = request("/createUser", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, userName: `Guest ${userId.slice(0, 4)}` }),
        }).then(user => {
            localStorage.setItem("token", user.token);
            return user.token;
        }).finally(() => {
            creatingSession = null;
        });
    }

    return creatingSession;
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
