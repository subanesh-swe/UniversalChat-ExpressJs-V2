const socket = io.connect('http://localhost:3000', { query: { userId: UserId } });
//const socket = io.connect(window.location.protocol + "//" + window.location.hostname + ((window.location.port) ? ":4000" : ""), { query: { userId: UserId } });

const sender = document.querySelector("#Name");
const text_input = document.querySelector('#input-message');
const send_message = document.querySelector("#send-message");

const chat_log = document.querySelector("#chat-log");
const input_container = document.querySelector("#input-container");


socket.on('connect', () => {
    console.log(`UserId: ${UserId} --> Connected with id ${socket.id}`);
});


socket.on('disconnect', () => {
    console.log(`UserId: ${UserId} --> Disconnected with id ${socket.id}`);
});


send_message.addEventListener("click", () => {

    const message = text_input.value.replace(/^[ \t]*[\r\n]+/gm, '');
    if (message == "") return;
    const sendData = {
        recipientIds: RecipientIds,
        roomId: RoomId,
        data: {
            message: message,
            sender: UserName,
        }
    };

    socket.emit("sendMessage", sendData);
    console.log(`Sending message --> roomId:'${sendData.roomId}', recipientId:'${sendData.recipientId}', data:'${JSON.stringify(sendData)}' `);

    // convert html contents to text (if any)
    const rawMessageDiv = document.createElement("div");
    rawMessageDiv.textContent = message;
    var rawMessage = rawMessageDiv.innerHTML;

    var currentdate = new Date();
    var datetime = currentdate.getDay() + "/" + currentdate.getMonth()
        + "/" + currentdate.getFullYear() + " @ "
        + currentdate.getHours() + ":"
        + currentdate.getMinutes() + ":" + currentdate.getSeconds();
    var msg =
        "<div class='chat self'>" +
        "<div class='message'>" +
        /*"<div class='username'>" + sender.innerHTML + "</div>" +*/
        "<div class='textcont'>" + rawMessage + "</div>" +
        "<div class='time'>" + datetime + "</div>" +
        "</div>" +
        "</div>";
    chat_log.innerHTML += msg;
    console.log("sending msg:" + msg);
    text_input.value = "";
    text_input.style.height = 'auto';
    text_input.style.height = `${1.2}rem`;
});



socket.on("receiveMessage", (receivedData) => {

    const { recipientIds, roomId, data } = receivedData;
    console.log(`Received message --> roomId:'${roomId}', recipientIds:'${recipientIds}', data:'${data}' `);
    if (RoomId !== roomId) return;

    const message = data.message.replace(/^[ \t]*[\r\n]+/gm, '');
    if (message == "") return;
    // convert html contents to text (if any)
    const rawMessageDiv = document.createElement("div");
    rawMessageDiv.textContent = message;
    var rawMessage = rawMessageDiv.innerHTML;

    var currentdate = new Date();
    var datetime = currentdate.getDay() + "/" + currentdate.getMonth()
        + "/" + currentdate.getFullYear() + " @ "
        + currentdate.getHours() + ":"
        + currentdate.getMinutes() + ":" + currentdate.getSeconds();
    var msg =
        "<div class='chat friend'>" +
        "<div class='message'>" +
        "<div class='username'>" + data.sender + "</div>" +
        "<div class='textcont'>" + rawMessage + "</div>" +
        "<div class='time'>" + datetime + "</div>" +
        "</div>" +
        "</div>";

    if (data.sender !== UserName)
        chat_log.innerHTML += msg;
    console.log("Received msg:" + msg);
});

input_container.addEventListener('click', function (event) {
    text_input.focus();
});

text_input.addEventListener('input', () => {
    if (text_input.value == "") {
        text_input.style.height = `${1.2}rem`;
    } else {
        //text_input.style.height = 'auto';
        text_input.style.height = `${text_input.scrollHeight}px`;
    }
});


function logout() {
    // Clear local storage
    localStorage.clear();
    // Redirect to login page
    window.location.href = "/login";
}