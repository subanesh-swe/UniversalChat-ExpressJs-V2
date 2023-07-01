function formSubmitHandler(event, formId) {
    event.preventDefault();
    const formData = new FormData(document.getElementById(formId));
    //console.log(JSON.stringify(Object.fromEntries(formData.entries())));
    const data = Object.fromEntries(formData.entries());
    console.log("posting data = " + JSON.stringify(data));
    //fetch('/messenger/rooms', {
    fetch(window.location.pathname, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => {
            console.log("response data = " + JSON.stringify(data));
            if (data.result === true) {
                //alert(`Result : true -> ${JSON.stringify(data)}`);
                window.location.href = data.redirect;
            } else {
                alert(data.alert);
            }
        })
        .catch(error => {
            alert("Something went wrong, Try again after sometime!!!");
            console.error(error);
        });
}


var preExecuted = true;
function chechInputLengthValidity(input, warningLabelId) {
    const warningLabel = document.getElementById(warningLabelId);
    var currExecuted = "nochange";
    var warningMsg = "";
    //console.log(`input ---- length(${input.value.length})`);
    if (input.value.length >= input.maxLength && preExecuted) {
        console.log(`input... reached limit`);
        warningMsg = `Max length ${input.maxLength}`;
        currExecuted = false;
    } else if (!preExecuted) {
        console.log(`input... within limit`);
        currExecuted = true;
    }
    if (currExecuted !== "nochange") {
        warningLabel.innerHTML = warningMsg;
        input.setCustomValidity(warningMsg);
        //if (!input.checkValidity()) {
        //    input.reportValidity();
        //}
        //the above method will give notify, if not used it will be notified at submission only
        preExecuted = currExecuted;
    }
}

function togglePassword(eyeBtnId, passwordFieldId) {
    const eyeBtn = document.getElementById(eyeBtnId);
    const passwordField = document.getElementById(passwordFieldId);

    if (passwordField.type === "password") {
        eyeBtn.setAttribute("class", "eye-slash");
        passwordField.type = "text";
    } else {
        eyeBtn.setAttribute("class", "eye");
        passwordField.type = "password";
    }
}
