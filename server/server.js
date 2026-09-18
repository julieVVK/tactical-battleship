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


app.listen(PORT, () => {
    console.log(`Server has been started on http://localhost:${PORT}`)
})