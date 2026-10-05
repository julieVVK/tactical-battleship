// File was created by Vladyslav Doroshenko

const errorStatuses = new Map([
    ["INVALID_USER_ID", 400],
    ["INVALID_USER_NAME", 400],
    ["USER_ALREADY_EXISTS", 409],
    ["INVALID_REQUEST_BODY", 400],
    ["INVALID_FLEET", 400],
    ["USER_NOT_FOUND", 404],
    ["GAME_NOT_FOUND", 404],
    ["INVALID_GAME_ID", 400],
    ["PLAYER_ALREADY_JOINED", 409],
    ["GAME_JOIN_CLOSED", 409],
    ["GAME_FULL", 409],
    ["PLAYER_NOT_IN_GAME", 403],
    ["PLAYER_ALREADY_READY", 409],
    ["SHIP_PLACEMENT_CLOSED", 409],
    ["BATTLE_NOT_ACTIVE", 409],
    ["TURN_MISMATCH", 409],
    ["INVALID_SHOT_COORDINATES", 400],
    ["SHOT_DUPLICATE", 409],
    ["SESSION_NOT_FOUND", 401],
])


export const decodeError = (error) => {
    const status = errorStatuses.get(error.code)

    if (status) {
        return {status, code: error.code, message: error.message}
    }

    if (error.type === "entity.parse.failed") {
        return {status: 400, code: "INVALID_JSON", message: "The request body must contain valid JSON."}
    }

    if (error.type === "entity.too.large") {
        return {status: 413, code: "PAYLOAD_TOO_LARGE", message: "The request body is too large."}
    }

    return {status: 500, code: "INTERNAL_ERROR", message: "The server could not complete this request."}
}


export default function errorHandler(error, req, res, next) {
    if (res.headersSent) return next(error)

    const {status, code, message} = decodeError(error)
    if (status === 500) console.error(error)
    if (status === 401) res.set("WWW-Authenticate", "Bearer")

    return res.status(status).json({
        error: {code, message}
    })
}
