const messageList = document.querySelector("ul");
const messageForm = document.querySelector("#message");
const nicknameForm = document.querySelector("#nickname");
const socket = new WebSocket(`ws://${window.location.host}`);
socket.addEventListener("open", () => {
    console.log("Connected to Server");
});

socket.addEventListener("message", (message) => {
    const li = document.createElement("li");
    li.innerText = message.data;
    messageList.append(li);
});

socket.addEventListener("close", () => {
    console.log("Disconnected from server");
});

const makeMsg = (type, payload) => {
    var msg = {type, payload};
    return JSON.stringify(msg);
}
messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = messageForm.querySelector("input");
    socket.send(makeMsg("new_message", input.value));
    input.value = "";
});

nicknameForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = nicknameForm.querySelector("input");
    socket.send(makeMsg("nickname", input.value));
    input.value = "";
})