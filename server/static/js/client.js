
const socket = io();

const loginScreen = document.querySelector('.login')
const chatScreen = document.querySelector('.chat')
const loginForm = document.querySelector('.loginForm')
const chatForm = document.querySelector('.chatForm')
const message = document.getElementById('message')
const nickname = document.getElementById('nickname')
const messageList = document.getElementById('messages')

// appendMessage('You joined')

loginForm.addEventListener('submit', (event) => {
    event.preventDefault()
    
    socket.emit('send-nickname', nickname.value)
    loginScreen.style.display = 'none'
    chatScreen.style.display = 'block'
    
})

chatForm.addEventListener('submit', (event) => {
    event.preventDefault()

    if(message.value != ''){
    appendMessage(`You: ${message.value}`, 'yourMessage')
    socket.emit('chat message', message.value)
    message.value = ''
    }
    
})


socket.on('chat message', (msg) => {
    appendMessage(msg, 'incomingMessage')
})

socket.on('user connected', (nickname) => {
    appendMessage(nickname, 'serverNotification')
})

socket.on('server message', (msg) => {
    appendMessage(msg, 'serverMessage')
})

socket.on('challenge', (word) => {
    appendMessage(word, 'serverMessage')
})

socket.on('winner', (winner) => {
    appendMessage(winner, 'winnerMessage')
})

function appendMessage(message, classToBeAdded){
    
    let li = document.createElement('li')
    li.className = classToBeAdded
    li.appendChild(document.createTextNode(message))

    messageList.appendChild(li)
}

