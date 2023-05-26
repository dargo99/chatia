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
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} at ${hours}:${minutes}`;
    }
}

let lastMessageElement = document.getElementById('status');
let lastMessageTime = new Date();
lastMessageElement.innerHTML = `${formatMessageTime(lastMessageTime)}`;

function getCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
}

let audioContext = new (window.AudioContext || window.webkitAudioContext)();
let recorder;

function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function(stream) {
        let input = audioContext.createMediaStreamSource(stream);
        recorder = new Recorder(input, { numChannels: 1 });
        recorder.record();
    }).catch(function(err) {
        console.error('Error al iniciar la grabación: ' + err);
    });
}

document.getElementById('record-button').addEventListener('click', startRecording);


const textarea = document.getElementById('wisdom');

function adjustTextareaHeight() {
    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;
    const desiredHeight = scrollHeight - 23;
    textarea.style.height = `${desiredHeight}px`;
}

textarea.addEventListener('input', adjustTextareaHeight);

document.getElementById('send-button').addEventListener('click', function () {
    stopRecording();
    adjustTextareaHeight();
    setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 100);
});

document.addEventListener("DOMContentLoaded", function () {
    textarea.addEventListener("keypress", function (e) {
        if (e.key === 'Enter' || e.keyCode === 13) {
            e.preventDefault();  // Evita que se agregue una nueva línea
            createResponse();
            adjustTextareaHeight();
            setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 100);
        }
    });
});
