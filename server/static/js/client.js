console.log('it works')

var socket = io();


const chatForm = document.querySelector('.chatForm')
const message = document.getElementById('message')
const nickname = prompt('Your name:')
const messageList = document.getElementById('messages')

appendMessage('You joined')

socket.emit('send-nickname', nickname)

chatForm.addEventListener('submit', (event) => {
    event.preventDefault()

    if(message.value != ''){
    appendMessage(`You: ${message.value}`)
    socket.emit('chat message', message.value)
    message.value = ''
    }
    
})



socket.on('chat message', (msg) => {
    appendMessage(`${msg.nickname}: ${msg.msg}`)
})

socket.on('user connected', (nickname) => {
    appendMessage(`${nickname} has entered the room`)
})

function appendMessage(message){
    
    let li = document.createElement('li')
    li.appendChild(document.createTextNode(message))

    messageList.appendChild(li)
}