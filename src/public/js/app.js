var socket = new WebSocket(`ws://${window.location.host}`);
socket.addEventListener("open", () => {
    console.log("Connected to Server");
});

socket.addEventListener("message", (message) => {
    console.log("Just got this ", message.data, " from server");
});

socket.addEventListener("close", () => {
    console.log("Disconnected from server");
});

setTimeout(() => {
    socket.send("Hello from the browser");
}, 5000);