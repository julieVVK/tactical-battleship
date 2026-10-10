import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export default function useGameSocket({ gameId, token, onGameState, onSessionLost, onGameLost }) {
    const [connection, setConnection] = useState(null);
    const retry = useRef(null);

    useEffect(() => {
        if (!gameId || !token) {
            retry.current = null;
            return;
        }

        let active = true;
        const socket = io({ auth: { token }, autoConnect: false });
        function updateConnection(status, error = "") {
            setConnection({ gameId, token, status, error });
        }

        function handleError(error) {
            if (!active) return;
            if (error?.code === "SESSION_NOT_FOUND") {
                onSessionLost("Your session ended. Create or join a lobby again.");
            } else if (["GAME_NOT_FOUND", "PLAYER_NOT_IN_GAME", "INVALID_GAME_ID"].includes(error?.code)) {
                onGameLost(error.message);
            } else {
                updateConnection("error", error?.message || "Couldn't connect to the lobby. Try again.");
            }
        }

        function subscribe() {
            updateConnection("connecting");
            socket.timeout(5000).emit("game:subscribe", { gameId }, (error, reply) => {
                if (!active) return;
                if (error || !reply?.ok) {
                    handleError(reply?.error || { message: "Couldn't subscribe to the lobby. Try again." });
                } else {
                    updateConnection("connected");
                }
            });
        }

        socket.on("connect", subscribe);
        socket.on("game:state", game => {
            if (active && game.id === gameId) onGameState(game);
        });
        socket.on("game:error", handleError);
        socket.on("connect_error", error => handleError(error.data));
        socket.on("disconnect", reason => {
            if (!active) return;
            if (reason === "io server disconnect") {
                onSessionLost("Your session ended. Create or join a lobby again.");
            } else {
                updateConnection("connecting", "Connection lost. Reconnecting...");
            }
        });

        retry.current = () => {
            if (socket.connected) subscribe();
            else {
                updateConnection("connecting");
                socket.connect();
            }
        };
        socket.connect();

        return () => {
            active = false;
            retry.current = null;
            socket.removeAllListeners();
            socket.disconnect();
        };
    }, [gameId, token, onGameState, onSessionLost, onGameLost]);

    const reconnect = useCallback(() => retry.current?.(), []);
    const isCurrent = gameId && token && connection?.gameId === gameId && connection?.token === token;
    return {
        status: !gameId || !token ? "idle" : isCurrent ? connection.status : "connecting",
        error: isCurrent ? connection.error : "",
        reconnect,
    };
}
