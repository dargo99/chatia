let config;
let lexRuntime;
let lastMessageTime;
let lastMessageElement = document.getElementById('status');

fetch('chatia-config.json')
    .then(response => response.json())
    .then(data => {
        config = data;

        var poolName = "cognito-idp.".concat(config.region, ".amazonaws.com/").concat(config.cognito.appUserPoolName);
        var idtoken = localStorage.getItem("".concat(config.cognito.appUserPoolClientId, "idtokenjwt"));
        var logins = {};
        logins[poolName] = idtoken;

        console.log(idtoken);

        AWS.config.region = config.region;
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: config.cognito.poolId,
            Logins: logins
        });

        lexRuntime = new AWS.LexRuntime({
            region: config.lex.region
        });

        let userInputField = document.getElementById('user-input');

        userInputField.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                document.getElementById('send-button').click();
            }
        });

        lastMessageTime = new Date();
        lastMessageElement.innerHTML = `${formatMessageTime(lastMessageTime)}`;

        document.getElementById('send-button').addEventListener('click', function () {
            const userInput = userInputField.value;

            if (userInput.trim() !== '') {
                document.getElementById('chat-output').innerHTML += `<p class="user-output">${userInput}</p>`;
                sendMessageToLex(userInput, lexRuntime);
                document.getElementById('user-input').value = '';
                stopRecording();
                window.scrollTo(0, document.body.scrollHeight);
                document.getElementById('user-input').style.height = 'auto';
            }
        });
    });

function formatMessageTime(date) {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = date.getDate() == now.getDate() && date.getMonth() == now.getMonth() && date.getFullYear() == now.getFullYear();
    const isYesterday = date.getDate() == yesterday.getDate() && date.getMonth() == yesterday.getMonth() && date.getFullYear() == yesterday.getFullYear();

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    if (isToday) {
        return `Hoy a las ${hours}:${minutes} // Procesando respuesta...`;
    } else if (isYesterday) {
        return `Ayer a las ${hours}:${minutes}`;
    } else {
        return `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()} at ${hours}:${minutes}`;
    }
}

function sendMessageToLex(message, lexRuntime) {
    const params = {
        botName: config.lex.botName,
        botAlias: config.lex.botAlias,
        userId: 'user-id',
        inputText: message
    };

    lexRuntime.postText(params, function(err, data) {
        if (err) {
            console.error(err);
        } else {
            console.log('Respuesta de ChatIA:', data);
            document.getElementById('chat-output').innerHTML += `<p><strong>Bot:</<strong> ${data.message}</p>`;
            window.scrollTo(0, document.body.scrollHeight);
            lastMessageTime = new Date();
            lastMessageElement.innerHTML = `Last response received: ${formatMessageTime(lastMessageTime)}`;
        }
    });
}

function getCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
}


let audioContext = new (window.AudioContext || window.webkitAudioContext)();
let recorder;

// Función para iniciar la grabación
function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function(stream) {
        let input = audioContext.createMediaStreamSource(stream);
        recorder = new Recorder(input, { numChannels: 1 });
        recorder.record();
    }).catch(function(err) {
        console.error('Error al iniciar la grabación: ' + err);
    });
}

// Función para detener la grabación y enviar el audio a Amazon Lex
function stopRecording() {
    if (recorder) {
        recorder.stop();
        recorder.exportWAV(function (blob) {
            let reader = new FileReader();
            reader.onload = function (event) {
                let arrayBuffer = event.target.result;
                let view = new DataView(arrayBuffer);
                let blobData = new Uint8Array(view.byteLength);

                for (let i = 0; i < view.byteLength; i++) {
                    blobData[i] = view.getUint8(i);
                }

                const params = {
                    botName: config.lex.botName,
                    botAlias: config.lex.botAlias,
                    userId: 'user-id',
                    contentType: 'audio/l16; rate=16000; channels=1',
                    accept: 'text/plain; charset=utf-8',
                    inputStream: blobData
                };

                lexRuntime.postContent(params, function (err, data) {
                    if (err) {
                        console.error(err);
                    } else {
                        document.getElementById('chat-output').innerHTML += `<p>Bot: ${data.message}</p>`;
                        window.scrollTo(0, document.body.scrollHeight);
                    }
                });
            };

            reader.readAsArrayBuffer(blob);
        });
    }
}

const textarea = document.getElementById('user-input');

textarea.addEventListener('input', () => {
  textarea.style.height = 'auto';
  const scrollHeight = textarea.scrollHeight;
  const desiredHeight = scrollHeight - 24;
  textarea.style.height = `${desiredHeight}px`;
});

// Añadir oyentes de eventos a los botones de grabación y envío
document.getElementById('record-button').addEventListener('click', startRecording);

// Añadir oyente de evento para desplazarse al final del chat
document.addEventListener("DOMContentLoaded", function() {window.scrollTo(0, document.body.scrollHeight);});
