//const socket = io.connect('http://localhost:3000', { query: { userId: UserId } });
const socket = io.connect(window.location.protocol + "//" + window.location.hostname + ((window.location.port) ? ":3000" : ""), { query: { userId: UserId } });

const text_input = document.querySelector('#input-message');
const send_message = document.querySelector("#send-message");

const console_log = document.querySelector("#console-log");
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
        deviceId: DeviceId,
        data: {
            message: message,
            sender: UserName,
        }
    };

    socket.emit("iotSendMessage", sendData);
    console.log(`Sending message --> deviceId:'${sendData.deviceId}', recipientId:'${sendData.recipientId}', data:'${JSON.stringify(sendData)}' `);

    // convert html contents to text (if any)
    const rawMessageDiv = document.createElement("div");
    rawMessageDiv.textContent = message;
    var rawMessage = rawMessageDiv.innerHTML;

    var currentdate = new Date();
    var datetime = currentdate.getDate() + "/" + currentdate.getMonth() + "/" + currentdate.getFullYear() +
        " " + currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();

    var msg =
        "<p>" +
        "<div class='device'>" +
        "<span class='info'>[" + UserName + "] " + datetime + "> </span>" +
        rawMessage +
        "</div>" +
        "</p>";
    console_log.innerHTML += msg;
    console.log("sending msg:" + msg);
    text_input.value = "";
    text_input.style.height = 'auto';
    text_input.style.height = `${1.2}rem`;
});



socket.on("iotReceiveMessage", (receivedData) => {

    const { recipientIds, deviceId, data } = receivedData;
    console.log(`Received message --> deviceId:'${deviceId}', recipientIds:'${recipientIds}', data:'${data}' `);
    if (DeviceId !== deviceId) return;

    const message = data.message.replace(/^[ \t]*[\r\n]+/gm, '');
    if (message == "") return;
    // convert html contents to text (if any)
    const rawMessageDiv = document.createElement("div");
    rawMessageDiv.textContent = message;
    var rawMessage = rawMessageDiv.innerHTML;

    var currentdate = new Date();
    var datetime = currentdate.getDate() + "/" + currentdate.getMonth() + "/" + currentdate.getFullYear() +
        " " + currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();

    var msg =
        "<p>" +
        "<div class='device'>" +
        "<span class='info'>[" + data.sender + "] " + datetime  +"> </span>" +
        rawMessage +
        "</div>" +
        "</p>";

    if (data.sender !== UserName)
        console_log.innerHTML += msg;
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