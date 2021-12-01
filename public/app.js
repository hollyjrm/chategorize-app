const socket = io();

var form = document.getElementById('form');
var input = document.getElementById('input');
let messages = document.getElementById('messages');
let username = document.getElementById('yourname').textContent.trim();

form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (input.value) {
        socket.emit('chat message', input.value);

        input.value = '';
    }
});

socket.emit('sendUserName', username);

socket.emit('userConnected', username)

socket.on('userConnected', function (username) {
    var item = document.createElement('li');

    item.textContent = username + ' is here';
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);

})

socket.on('outputMessage', function (msg) {

    if (msg.length) {
        for (var x = 0; x < msg.length; x++) {
            var dbMessage = document.createElement('li');
            dbMessage.textContent = `${msg[x].sender}: ${msg[x].message}`;
            messages.appendChild(dbMessage);
        }
    }
    // messages.appendChild(item);
    // window.scrollTo(0, document.body.scrollHeight);

});

socket.on('chat message', function (msg) {
    var item = document.createElement('li');
    item.textContent = msg;// currently displays your username for all new messages 
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
});



socket.on('userLeft', function (username) {
    var item = document.createElement('li');
    item.textContent = username + ' has left';
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);

})