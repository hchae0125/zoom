import express from 'express';
import http from 'http';
import { StringDecoder } from 'string_decoder';
import WebSocket from 'ws';

const app = express();
app.set("view engine", "pug");
app.set("views", __dirname + "/views")
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const server = http.createServer(app);
const wss = new WebSocket.Server({server});

wss.on("connection", (socket) => {
    console.log("Connected to Browser.");
    socket.on("close", () => {
        console.log("Disconnected from the browser.");
    });
    socket.on("message", (message) => {
        const decoder = new StringDecoder('utf8');    
        console.log(decoder.write(message));
    })
    socket.send("hello!");
});

const handleListen = () => {
    console.log(`Listening on http://localhost:3000`);
}

server.listen(3000, handleListen);


