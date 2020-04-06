console.log('it works')

var socket = io();

const form = document.querySelector('form')
const input = document.getElementById('m')
const messages = document.getElementById('messages')
console.log(form)
console.log(input)

form.addEventListener('submit', (event) => {
    event.preventDefault()


    socket.emit('chat message', input.value)
})

socket.on('chat message', (msg) => {

    let li = document.createElement('li')
    li.appendChild(document.createTextNode(msg))

    messages.appendChild(li)
})