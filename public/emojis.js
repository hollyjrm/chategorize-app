let heart = document.getElementById('heart');
let tongue = document.getElementById('tongue');
let thumbsUp = document.getElementById('thumbsUp');
let grin = document.getElementById('grin');
let cry = document.getElementById('cry');
let thumbsDown = document.getElementById('thumbsDown');
let kiss = document.getElementById('kiss');
let laugh = document.getElementById('laugh');
let monkey = document.getElementById('monkey');
let sweat = document.getElementById('sweat');
let grimace = document.getElementById('grimace');
let dog = document.getElementById('dog');

let mess = document.getElementById('input');

function emojiPaste(element) {
    element.addEventListener('click', (event) => {
        console.log(element.textContent)
        let result = mess.value + element.textContent.trim();
        console.log(result)
        mess.value = result;
        event.preventDefault();

    })
}

emojiPaste(heart)
emojiPaste(tongue)
emojiPaste(thumbsUp)
emojiPaste(grin)
emojiPaste(cry)
emojiPaste(thumbsDown)
emojiPaste(kiss)
emojiPaste(laugh)
emojiPaste(monkey)
emojiPaste(sweat)
emojiPaste(grimace)
emojiPaste(dog)
