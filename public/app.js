var form = document.getElementById('form');
var input = document.getElementById('input');
let messages = document.getElementById('messages');
let username = document.getElementById('yourname').textContent.trim();
var messageHistoryCont = document.getElementById('history');
var addFriendButton = document.getElementById('add-friend-form');
var addName = document.getElementById("add-friend-name");
var messageContainer = document.getElementById('message-container');

// getting chat name from query string
// function getQueryVariable(variable) {
//     if (window.location.search) {
//         var query = window.location.search.substring(1);
//         var vars = query.split("&");
//         for (var i = 0; i < vars.length; i++) {
//             var pair = vars[i].split("=");
//             if (pair[0] == variable) { return pair[1]; }
//         }
//         return (false);
//     }
// }

// let chatname = document.getElementById('chatname').value;
let title = document.getElementById('chat-title');
// let chatnameTitle = chatname.replaceAll('+', ' ')
let thisId = document.getElementById('room-id');
let thisRoomId = thisId.textContent.trim();


// title.textContent = chatname;
let chatnameTitle = title.textContent.trim();
console.log(`title man: ${chatnameTitle}`)
let chatMembers = document.getElementById('chat-members')

const socket = io();

socket.emit('sendUserName', username);

//join new room
// should we make this unique? 
let obj = {
    chatname: chatnameTitle,
    id: thisRoomId
}

socket.emit('joinRoom', obj); // pass obj which contains title and id

socket.on('chatMembers', function (currMembers) {

    console.log(currMembers)
    let userSet = new Set(currMembers);
    chatMembers.innerHTML = '';

    userSet.forEach(el => {
        let each = document.createElement('div');
        each.textContent = el.username;
        chatMembers.appendChild(each);
    })

    chatMembers.style.background = 'rgb(253, 252, 220)';
})

// displays message history from DB
socket.on('outputMessage', function (msg) {

    if (msg.length && messageHistoryCont.innerHTML == "") {
        for (var x = 0; x < msg.length; x++) {
            var dbMessage = document.createElement('li');
            dbMessage.classList.add("message-color");
            if (msg[x].sender.username == username) {
                dbMessage.id = "my-messages";
            }
            dbMessage.textContent = `${msg[x].sender.username}: ${msg[x].message}`;
            messageHistoryCont.appendChild(dbMessage);
        }
    }
});


form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (input.value) {
        socket.emit('chat message', input.value);
        input.value = '';
    }
});

addFriendButton.addEventListener('submit', function (e) {
    e.preventDefault();
    if (addName.value) {
        socket.emit('addFriend', addName.value);
        addName.value = '';
        location.reload();
        return false;
    }
})


socket.on('chat message', function (msg) {
    var item = document.createElement('li');
    item.classList.add("message-color");

    if (msg.user == username) {
        item.id = "my-messages";
    }
    item.textContent = `${msg.user}: ${msg.msg}`;
    messages.appendChild(item);
    messageContainer.scrollTop = messageContainer.scrollHeight;

});

socket.on('userLeft', function (username) {
    console.log(username + ' has left');
    // var item = document.createElement('li');
    // item.textContent = username + ' has left';
    // messages.appendChild(item);
})