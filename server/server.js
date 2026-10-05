// Created by Vladyslav Doroshenko on 18.09.26

import express from "express";
import {createServer} from "node:http";
import {Server} from "socket.io";
import cors from "cors";

import { prepareFleet } from "./placement.js";
import errorHandler from "./errorHandler.js"
import socketHandlers from "./socketHandlers.js"
import createUserRouter from "./routes/userRoutes.js"
import createGameRouter from "./routes/gameRoutes.js"

const app = express()
const PORT = process.env.PORT || 3000


const server = createServer(app);
const io = new Server(server,{cors: {origin: "*"}})
socketHandlers(io)


app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


/* DEBUG ROUTE*/
app.post("/api/dev/fleet", (req, res) => {
    const fleet = prepareFleet(req.body.board); // REMOVE .board WHEN DONE WITH TESTING

    if (fleet.error) {
        return res.status(400).json(fleet);
    }

    console.log(fleet)              // debug
    console.log(fleet[0].cells[0])  // debug

    return res.status(200).json({
        valid: true,
        fleet
    });
});

app.use("/api", createUserRouter(io))
app.use("/api", createGameRouter(io))


app.get('/api/ping', (req, res) => {
    res.json({message: "pong"} )
})


app.use(errorHandler)
server.listen(PORT, '127.0.0.1', (error) => {
    if(error) {console.log(`ERROR has occurred: ${error}`)}
    console.log(`Server started on http://localhost:${server.address().port}`)
})
