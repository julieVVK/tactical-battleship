// Created by Vladyslav Doroshenko on 18.09.26
const express = require("express")
const path = require("path");
const app = express()
const PORT = 3000

app.use(express.static("/build/dist"))
app.use(express.json())
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => {
    return res.sendFile(path.join(__dirname, "server.js"))
});

app.get('/api/helloWorld', (req, res) => {
    console.log("new api call on /api/helloWorld has been made")
    res.json({ message: "This is Express talking to you from server.js file", message2: "Backend is working fine"})
});


app.listen(PORT, '127.0.0.1', (err) => {
    if(err) {console.log(`ERROR has occured: ${err}`)}
    console.log(`Server has been started on http://localhost:${PORT}`)
})
