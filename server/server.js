// Created by Vladyslav Doroshenko on 18.09.26
const express = require("express")
const app = express()
const path = require("path");
const {createServer} = require("node:http");
const { Server } = require("socket.io");
const cors = require("cors")
const PORT = process.env.PORT || 3000


const server = createServer(app);
const io = new Server(server,{cors: {origin: "*"}})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())


app.get('/api/ping', (req, res) => {
    res.json({message: "pong"} )
})


io.on("connection", (socket) => {
    console.log(`User with id "${socket.id}" connected`)

    socket.on("ping", (msg) => {
        console.log("new message: " + msg)
        socket.emit("pong", "pong")
    })

    socket.on("disconnect", (reason, description) => {
        console.log(`User disconnected:
        reason: ${reason},
        description: ${description}`)
        socket.disconnect()
    })
})


server.listen(PORT, '127.0.0.1', (err) => {
    if(err) {console.log(`ERROR has occurred: ${err}`)}
    console.log(`Server started on http://localhost:${PORT}`)
})
