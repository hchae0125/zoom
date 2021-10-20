const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelct = document.getElementById("cameras");

let myStream;
let muted = false;
let cameraOff = false;

const getCameras = async () => {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(x => x.kind === "videoinput");
        const currentCamera = myStream.getVideoTracks()[0];
        cameras.forEach(camera => {
            const option = document.createElement("option");
            option.value = camera.deviceId;
            option.innerText = camera.label;
            if (currentCamera.label === camera.label) {
                option.selected = true;
            }
            camerasSelct.appendChild(option);
        })
    } catch (e) {
        console.log(e);
    }
}

const getMedia = async (deviceId) => {
    const initialContraints = {
        audio: true,
        video: { facingMode: "user"}
    };

    const cameraContraints = {
        audio: true,
        video: { deviceId: { exact: deviceId} }, 
    };
    try {
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceId ? cameraContraints : initialContraints
        );
        myFace.srcObject = myStream;
        if (!deviceId) {
            await getCameras();
        }
    } catch (e) {
        console.log(e);
    }
}

const handleMuteBtnClick = () => {
    myStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
    });
    if (!muted) {
        muteBtn.innerText = "Unmute";
    } else {
        muteBtn.innerText = "Mute";
    }
    muted = !muted;
} 

const handleCameraBtnClick = () => {
    myStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
    });

    if (cameraOff) {
        cameraBtn.innerText = "Turn Camera Off";
    } else {
        cameraBtn.innerText = "Turn Camera On";
    }
    cameraOff = !cameraOff;
}

const handleCameraChange = async () => {
    await getMedia(camerasSelct.value);
}

getMedia();
muteBtn.addEventListener("click", handleMuteBtnClick);
cameraBtn.addEventListener("click", handleCameraBtnClick);
camerasSelct.addEventListener("change", handleCameraChange)

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

socket.on("welcome", (user, newCount) => {
    const h3 = room.querySelector("h3");
    h3.innerText = `Room: ${roomName} (${newCount})`;
    addMessage(`${user} joined.`)
});

socket.on("bye", (left, newCount) => {
    const h3 = room.querySelector("h3");
    h3.innerText = `Room: ${roomName} (${newCount})`;
    addMessage(`${left} left.`);
});

socket.on("new_message", addMessage);
socket.on("room_change", (rooms) => {
    const roomList = welcome.querySelector("ul");
    roomList.innerHTML = "";
    if (rooms.length === 0) {
        return;
    }
    
    rooms.forEach(room => {
        const li = document.createElement("li");
        li.innerText = room;
        roomList.append(li);
    });
});