/* // Obtener elementos del DOM
var textarea = $('#user-input');

function adjustTextareaHeight() {
    textarea.css('height', 'auto');
    var scrollHeight = textarea[0].scrollHeight;
    var desiredHeight = scrollHeight - 23;
    textarea.css('height', desiredHeight + 'px');
}

function enterKeyListener(e) {
    if (e.which === 13) {
        e.preventDefault();
        createResponse();
        adjustTextareaHeight();
        setTimeout(() => $('html, body').animate({ scrollTop: $(document).height() }, 100));
    }
}

function clickListener() {
    adjustTextareaHeight();
    setTimeout(() => $('html, body').animate({ scrollTop: $(document).height() }, 100));
}

export { adjustTextareaHeight, enterKeyListener, clickListener }; */

