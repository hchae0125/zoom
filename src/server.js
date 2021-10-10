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
const sockets = [];
wss.on("connection", (socket) => {
    sockets.push(socket);
    socket["nickname"] = "Anonymous";
    console.log("Connected to Browser.");
    socket.on("close", () => {
        console.log("Disconnected from the browser.");
    });
    socket.on("message", (message) => {
        const decoder = new StringDecoder('utf8'); 
        let decodedMsg = decoder.write(message);  
        const objMsg = JSON.parse(decodedMsg);
        console.log(objMsg);
        if (objMsg.type === "new_message") {
            sockets.forEach(aSocket => aSocket.send(`${socket.nickname}: ${objMsg.payload}`));
        } else if (objMsg.type === "nickname") {
            socket["nickname"] = objMsg.payload;
        }
        
        
        
    })
});

const handleListen = () => {
    console.log(`Listening on http://localhost:3000`);
}

server.listen(3000, handleListen);


