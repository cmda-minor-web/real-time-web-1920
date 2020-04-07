
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
    appendMessage(`You: ${message.value}`)
    socket.emit('chat message', message.value)
    message.value = ''
    }
    
})


socket.on('chat message', (msg) => {
    appendMessage(msg)
})

socket.on('user connected', (nickname) => {
    appendMessage(nickname)
})

socket.on('server message', (msg) => {
    appendMessage(msg)
})

socket.on('challenge', (word) => {
    appendMessage(word)
})

socket.on('winner', (winner) => {
    appendMessage(winner)
})

function appendMessage(message){
    
    let li = document.createElement('li')
    li.appendChild(document.createTextNode(message))

    messageList.appendChild(li)
}