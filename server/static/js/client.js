
const socket = io();

const loginScreen = document.querySelector('.login')
const chatScreen = document.querySelector('.chat')
const loginForm = document.querySelector('.loginForm')
const chatForm = document.querySelector('.chatForm')
const message = document.getElementById('message')
const nickname = document.getElementById('nickname')
const messageList = document.getElementById('messages')
const cardsSection = document.querySelector('.cards')
const gameField = document.querySelector('.gameField')

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
    console.log(word)
    appendMessage(word, 'serverMessage')
})  



socket.on('cards in hand', (cards) => {
    console.log('caards: ', cards)

    cards.cards.forEach(card => {

        let cardImage = document.createElement('img')

        cardImage.src = card.image
        
        cardImage.className = 'card'

        cardsSection.appendChild(cardImage)        
        
    });

const cardsInHand = document.querySelectorAll('.card')

//when card is clicked a broadcast to everyplayer needs to be sent
cardsInHand.forEach(card => {
    card.addEventListener('click', (event) => {
        const clickedCard = event.target.src

        let findCard = cards.cards.find(card => card.image === clickedCard)
        
        socket.emit('clicked card', findCard)


        gameField.appendChild(event.target)
        console.log(findCard)

        // clickedCard.remove()



    })
})

})

socket.on('clicked card', (card) => {
    console.log('clicked card: ', card)
})

// socket.on('show played card', (card) => {
//     console.log('kaart: ', card)
// })

// console.log(cardsSection.children)


socket.on('winner', (winner) => {
    appendMessage(winner, 'winnerMessage')
})

function appendMessage(message, classToBeAdded){
    
    let li = document.createElement('li')
    li.className = classToBeAdded
    li.appendChild(document.createTextNode(message))

    messageList.appendChild(li)
}

