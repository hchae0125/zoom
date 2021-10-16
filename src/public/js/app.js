const socket = io();

const nickname = document.getElementById("name");
const nicknameForm = nickname.querySelector("form");
const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");
const room = document.getElementById("room");
welcome.hidden = true;
room.hidden = true;

let roomName = "";

const handleNickNameSubmit = (e) => {
    e.preventDefault();
    const input = nicknameForm.querySelector("input");
    socket.emit("nickname", input.value, () => {
        nickname.hidden = true;
        welcome.hidden = false;
        console.log('done() executed.')
    });
}

const handleMessageSubmit = (e) => {
    e.preventDefault();
    const input = room.querySelector("#msg input");
    console.log('msg', input.value);
    socket.emit("new_message", input.value, roomName, () => {
        addMessage(`You: ${input.value}`);
        input.value = "";
    });
}

const showRoom = () => {
    room.hidden = false;
    welcome.hidden = true;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room: ${roomName}`;

    const msgForm = room.querySelector("#msg");
    msgForm.addEventListener("submit", handleMessageSubmit);
}

const handleRoomSubmit = (event) => {
    event.preventDefault();
    const input = welcomeForm.querySelector("input");
    socket.emit("enter_room", input.value, showRoom);
    roomName = input.value;
    input.value = "";
}

welcomeForm.addEventListener("submit", handleRoomSubmit);
nicknameForm.addEventListener("submit", handleNickNameSubmit);


const addMessage = (message) => {
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.append(li);
}

socket.on("welcome", (user) => {
    addMessage(`${user} joined.`)
});

socket.on("bye", (left) => {
    addMessage(`${left} left.`);
});

socket.on("new_message", addMessage);