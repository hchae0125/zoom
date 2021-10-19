import express from 'express';
import http from 'http';
import { StringDecoder } from 'string_decoder';
import WebSocket from 'ws';
import SocketIO from 'socket.io';

const app = express();
app.set("view engine", "pug");
app.set("views", __dirname + "/views")
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

const publicRooms = () => {
    const {
        sockets: {
            adapter: { sids, rooms },
        }
    } = wsServer;
    const publicRooms = [];
    rooms.forEach((_, key) => {
        if (sids.get(key) === undefined) {
            publicRooms.push(key);
        }
    });
    return publicRooms;
}

const countRoom = (roomName) => {
    return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection", socket => {
    // console.log(wsServer.sockets.adapter);
    socket["nickname"] = "Anonymous";
    socket.onAny((event) => {
        console.log(`Socket Event: ${event}`);
    });
    
    socket.on("enter_room", (roomName, done) => {
        socket.join(roomName);
        done();
        socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
        wsServer.sockets.emit("room_change", publicRooms());
    });

    socket.on("disconnecting", () => {
        socket.rooms.forEach(room => socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1));
        
    });

    socket.on("disconnect", () => {
        wsServer.sockets.emit("room_change", publicRooms());
    })

    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
        done();
    });

    socket.on("nickname", (nickname, done) => {
        console.log(nickname);
        socket["nickname"] = nickname;
        done();
    });
});

// const wss = new WebSocket.Server({server});
// const sockets = [];
// wss.on("connection", (socket) => {
//     sockets.push(socket);
//     socket["nickname"] = "Anonymous";
//     console.log("Connected to Browser.");
//     socket.on("close", () => {
//         console.log("Disconnected from the browser.");
//     });
//     socket.on("message", (message) => {
//         const decoder = new StringDecoder('utf8'); 
//         let decodedMsg = decoder.write(message);  
//         const objMsg = JSON.parse(decodedMsg);
//         console.log(objMsg);
//         if (objMsg.type === "new_message") {
//             sockets.forEach(aSocket => aSocket.send(`${socket.nickname}: ${objMsg.payload}`));
//         } else if (objMsg.type === "nickname") {
//             socket["nickname"] = objMsg.payload;
//         }
        
        
        
//     })
// });

const handleListen = () => {
    console.log(`Listening on http://localhost:3000`);
}

httpServer.listen(3000, handleListen);


