import test from "node:test"
import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import { once } from "node:events"
import { io } from "socket.io-client"

const board = Array.from({ length: 10 }, () => Array(10).fill(null))
const cells = []
for (const [index, [row, col, size]] of [
    [0, 0, 4], [0, 6, 3], [2, 0, 3], [2, 6, 2], [4, 0, 2],
    [4, 6, 2], [6, 0, 1], [6, 6, 1], [8, 0, 1], [8, 6, 1],
].entries()) {
    for (let offset = 0; offset < size; offset++) {
        board[row][col + offset] = `ship-${index}`
        cells.push({ row, col: col + offset })
    }
}

function event(socket, name) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            socket.off(name, handler)
            reject(new Error(`Timed out waiting for ${name}`))
        }, 4000)
        function handler(...args) {
            clearTimeout(timer)
            resolve(args)
        }
        socket.once(name, handler)
    })
}

test("HTTP actions and authenticated Socket.IO subscriptions", { timeout: 30000 }, async t => {
    const child = spawn(process.execPath, ["server.js"], {
        cwd: new URL("../", import.meta.url),
        env: { ...process.env, PORT: "0" },
        stdio: ["ignore", "pipe", "pipe"],
    })
    const sockets = []
    let output = ""
    child.stdout.on("data", data => { output += data })
    child.stderr.on("data", data => { output += data })
    t.after(async () => {
        sockets.forEach(socket => socket.disconnect())
        if (child.exitCode === null) {
            const exited = once(child, "exit")
            child.kill()
            await exited
        }
    })
    const baseUrl = await new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(`Server did not start: ${output}`)), 4000)
        child.once("error", error => { clearTimeout(timer); reject(error) })
        child.once("exit", code => { clearTimeout(timer); reject(new Error(`Server exited ${code}: ${output}`)) })
        child.stdout.on("data", () => {
            const match = output.match(/Server started on http:\/\/localhost:(\d+)/)
            if (match) {
                clearTimeout(timer)
                resolve(`http://127.0.0.1:${match[1]}`)
            }
        })
    })

    async function request(path, token, body, method = "POST") {
        const headers = {}
        if (token) headers.Authorization = `Bearer ${token}`
        if (body !== undefined) headers["Content-Type"] = "application/json"
        const response = await fetch(`${baseUrl}${path}`, {
            method, headers,
            body: body === undefined ? undefined : JSON.stringify(body),
        })
        return { status: response.status, data: await response.json() }
    }
    let sequence = 0
    async function user(name) {
        const result = await request("/api/createUser", null, { userId: `${name}-${++sequence}`, userName: name })
        assert.equal(result.status, 200)
        return result.data
    }
    async function connect(token, options = {}) {
        const socket = io(baseUrl, { auth: { token }, autoConnect: false, forceNew: true, ...options })
        sockets.push(socket)
        const connected = event(socket, "connect")
        socket.connect()
        await connected
        return socket
    }
    async function subscribe(socket, gameId) {
        const received = event(socket, "game:state")
        const ack = await socket.timeout(2000).emitWithAck("game:subscribe", { gameId })
        assert.deepEqual(ack, { ok: true, gameId: gameId.trim().toUpperCase() })
        return (await received)[0]
    }
    async function flush(socket) {
        const pong = event(socket, "pong")
        socket.emit("ping", "test")
        await pong
    }
    async function match() {
        const alice = await user("Alice")
        const bob = await user("Bob")
        const result = await request("/api/createGames", alice.token)
        const aliceSocket = await connect(alice.token)
        const bobSocket = await connect(bob.token, { transports: ["websocket"] })
        await subscribe(aliceSocket, result.data.id)
        const joined = event(aliceSocket, "game:state")
        assert.equal((await request(`/api/games/${result.data.id}/join`, bob.token)).status, 200)
        await joined
        await subscribe(bobSocket, result.data.id)
        return { alice, bob, aliceSocket, bobSocket, gameId: result.data.id }
    }

    await t.test("development fleet route rejects invalid boards before debug logging", async () => {
        const invalid = await request("/api/dev/fleet", null, { board: [] })
        assert.equal(invalid.status, 400)
        assert.equal(typeof invalid.data.error, "string")

        const valid = await request("/api/dev/fleet", null, { board })
        assert.equal(valid.status, 200)
        assert.equal(valid.data.valid, true)
        assert.equal(valid.data.fleet.length, 10)
    })

    await t.test("missing and unknown socket tokens return SESSION_NOT_FOUND", async () => {
        for (const token of [undefined, "unknown"]) {
            const socket = io(baseUrl, { auth: { token }, autoConnect: false, reconnection: false, forceNew: true })
            sockets.push(socket)
            const denied = event(socket, "connect_error")
            socket.connect()
            const [error] = await denied
            assert.equal(error.data.code, "SESSION_NOT_FOUND")
            assert.equal(socket.connected, false)
        }
    })

    await t.test("subscriptions check membership, normalize IDs and preserve a valid subscription on error", async () => {
        const alice = await user("Host")
        const bob = await user("Guest")
        const outsider = await user("Outsider")
        const created = await request("/api/createGames", alice.token)
        const gameId = created.data.id
        const socket = await connect(alice.token)
        assert.deepEqual(await subscribe(socket, ` ${gameId.toLowerCase()} `), created.data)
        const outsiderSocket = await connect(outsider.token)
        const rejected = await outsiderSocket.timeout(2000).emitWithAck("game:subscribe", { gameId })
        assert.equal(rejected.ok, false)
        assert.equal(rejected.error.code, "PLAYER_NOT_IN_GAME")
        for (const payload of [undefined, {}, { gameId: 42 }, { gameId: "bad" }]) {
            const ack = await socket.timeout(2000).emitWithAck("game:subscribe", payload)
            assert.equal(ack.error.code, "INVALID_GAME_ID")
        }
        const fallback = event(socket, "game:error")
        socket.emit("game:subscribe", { gameId: "bad" })
        assert.equal((await fallback)[0].code, "INVALID_GAME_ID")
        const nextState = event(socket, "game:state")
        const joined = await request(`/api/games/${gameId.toLowerCase()}/join`, bob.token)
        assert.equal(joined.status, 200)
        assert.equal((await nextState)[0].players.opponent.id, bob.id)
        assert.equal((await request(`/api/games/${gameId}`, null, undefined, "GET")).status, 401)
    })

    await t.test("Ready and Unready broadcast personal views, rejected actions broadcast nothing", async () => {
        const { alice, bob, aliceSocket, bobSocket, gameId } = await match()
        const stranger = await user("Unrelated")
        const unrelated = (await request("/api/createGames", stranger.token)).data
        const otherSocket = await connect(stranger.token)
        await subscribe(otherSocket, unrelated.id)
        const otherStates = []
        otherSocket.on("game:state", view => otherStates.push(view))
        for (const [action, body, ready] of [["ready", { board }, true], ["unready", undefined, false]]) {
            const first = event(aliceSocket, "game:state")
            const second = event(bobSocket, "game:state")
            const result = await request(`/api/games/${gameId}/${action}`, alice.token, body)
            assert.equal(result.status, 200)
            const [aliceView] = await first
            const [bobView] = await second
            assert.deepEqual(aliceView, result.data)
            assert.equal(aliceView.players.you.ready, ready)
            assert.equal(bobView.players.opponent.ready, ready)
            assert.equal(aliceView.players.you.ships.length, 10)
            assert.equal("ships" in bobView.players.opponent, false)
            assert.equal(bobView.players.you.id, bob.id)
        }
        const states = []
        aliceSocket.on("game:state", view => states.push(view))
        const rejected = await request(`/api/games/${gameId}/ready`, alice.token, { board: [] })
        assert.equal(rejected.status, 400)
        assert.equal(rejected.data.error.code, "INVALID_FLEET")
        await flush(aliceSocket)
        await flush(otherSocket)
        assert.equal(states.length, 0)
        assert.equal(otherStates.length, 0)
    })

    await t.test("multiple tabs receive updates and switching games replaces the subscription", async () => {
        const { alice, bob, aliceSocket, bobSocket, gameId } = await match()
        const extraTab = await connect(alice.token)
        await subscribe(extraTab, gameId)
        const newGame = (await request("/api/createGames", alice.token)).data
        await subscribe(aliceSocket, newGame.id)
        const switchedStates = []
        aliceSocket.on("game:state", view => switchedStates.push(view))
        const tabState = event(extraTab, "game:state")
        const bobState = event(bobSocket, "game:state")
        await request(`/api/games/${gameId}/ready`, bob.token, { board })
        assert.equal((await tabState)[0].players.opponent.ready, true)
        await bobState
        await flush(aliceSocket)
        assert.equal(switchedStates.length, 0)
    })

    await t.test("a full battle publishes misses, hits, sunk ships and victory to both players", async () => {
        const { alice, bob, aliceSocket, bobSocket, gameId } = await match()
        await request(`/api/games/${gameId}/ready`, alice.token, { board })
        const started = event(aliceSocket, "game:state")
        await request(`/api/games/${gameId}/ready`, bob.token, { board })
        const [battle] = await started
        const players = [alice, bob]
        const first = players.find(player => player.id === battle.turnPlayerId)
        const other = players.find(player => player.id !== first.id)
        const wrongTurn = await request(`/api/games/${gameId}/shots`, other.token, { row: 0, col: 0 })
        assert.equal(wrongTurn.data.error.code, "TURN_MISMATCH")
        const invalid = await request(`/api/games/${gameId}/shots`, first.token, { row: -1, col: 0 })
        assert.equal(invalid.data.error.code, "INVALID_SHOT_COORDINATES")

        async function shot(player, coordinates) {
            const a = event(aliceSocket, "game:state")
            const b = event(bobSocket, "game:state")
            const result = await request(`/api/games/${gameId}/shots`, player.token, coordinates)
            assert.equal(result.status, 200)
            const views = [(await a)[0], (await b)[0]]
            for (const view of views) {
                assert.equal("ships" in view.players.opponent, false)
                assert.equal(view.phase, result.data.phase)
                assert.equal(view.turnPlayerId, result.data.turnPlayerId)
                assert.equal(view.winnerPlayerId, result.data.winnerPlayerId)
                const shooter = view.players.you.id === player.id ? view.players.you : view.players.opponent
                assert.equal(shooter.shots.at(-1).result, result.data.result)
                assert.deepEqual(view, (await request(`/api/games/${gameId}`, players.find(p => p.id === view.players.you.id).token, undefined, "GET")).data)
            }
            return result.data
        }
        assert.equal((await shot(first, { row: 9, col: 9 })).result, "miss")
        let last
        for (const coordinate of cells) last = await shot(other, coordinate)
        assert.equal(last.result, "sunk")
        assert.equal(last.phase, "finished")
        assert.equal(last.winnerPlayerId, other.id)
        assert.equal(last.turnPlayerId, null)
        assert.equal((await request(`/api/games/${gameId}/shots`, other.token, { row: 9, col: 8 })).data.error.code, "BATTLE_NOT_ACTIVE")
    })

    await t.test("automatic reconnection re-subscribes and restores updates missed while offline", async () => {
        const { alice, bob, aliceSocket, gameId } = await match()
        await request(`/api/games/${gameId}/ready`, alice.token, { board })
        await flush(aliceSocket)
        aliceSocket.io.reconnectionDelay(600)
        aliceSocket.io.reconnectionDelayMax(600)
        aliceSocket.on("connect", () => {
            aliceSocket.emit("game:subscribe", { gameId })
        })
        const disconnected = event(aliceSocket, "disconnect")
        aliceSocket.io.engine.close()
        await disconnected
        assert.equal(aliceSocket.connected, false)
        const result = await request(`/api/games/${gameId}/ready`, bob.token, { board })
        assert.equal(result.data.phase, "battle")
        const resumed = event(aliceSocket, "game:state")
        const [view] = await resumed
        assert.equal(view.phase, "battle")
        assert.equal(view.players.you.ready, true)
        assert.equal(view.players.opponent.ready, true)
        assert.equal("ships" in view.players.opponent, false)
        assert.deepEqual(view, (await request(`/api/games/${gameId}`, alice.token, undefined, "GET")).data)
    })

    await t.test("signout disconnects all sockets for that token and rejects its reuse", async () => {
        const { alice, bob, aliceSocket, bobSocket, gameId } = await match()
        const extra = await connect(alice.token)
        const first = event(aliceSocket, "disconnect")
        const second = event(extra, "disconnect")
        assert.equal((await request("/api/signout", alice.token, undefined, "GET")).status, 200)
        assert.equal((await first)[0], "io server disconnect")
        assert.equal((await second)[0], "io server disconnect")
        assert.equal(bobSocket.connected, true)
        assert.equal((await request(`/api/games/${gameId}`, alice.token, undefined, "GET")).status, 401)
        assert.equal((await request(`/api/games/${gameId}`, bob.token, undefined, "GET")).status, 200)
        const denied = event(aliceSocket, "connect_error")
        aliceSocket.connect()
        assert.equal((await denied)[0].data.code, "SESSION_NOT_FOUND")
    })
})
