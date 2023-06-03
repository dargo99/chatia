import { AWSLex } from './aws-lex.js';

$(document).ready(function() {
    var lex = new AWSLex();

    $('#send-button').click(function() {
        var userInput = $('#user-input').val();
        lex.postText(userInput).then(function(data) {
            $('#chat-output').append('<p class="bot-output"><strong>ChatIA: </strong>' + data.message + '</p>');
        }).catch(function(err) {
            console.log(err, err.stack);
        });
    });
});