
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
        
        appendCard(cardsSection, card.image, 'card')
        
    });

const cardsInHand = document.querySelectorAll('.card')

//when card is clicked a broadcast to everyplayer needs to be sent
cardsInHand.forEach(card => {
    card.addEventListener('click', (event) => {
        const clickedCard = event.target.src

        let findCard = cards.cards.find(card => card.image === clickedCard)
        
        socket.emit('clicked card', findCard, cards)
        // console.log('maaaa', console.log(indexOf(findCard)))
        // gameField.appendChild(event.target)
        // console.log(findCard)

        // clickedCard.remove()

        event.target.remove()

    })
})

})

socket.on('clicked card', (card, cards) => {
    console.log('clicked card: ', card)
    //Now append the card to the playfield

    appendCard(gameField, card.image, 'playedCard')

    console.log(cards)
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

function appendCard(section, source, classToBeAdded){
    let cardImage = document.createElement('img')

    cardImage.src = source

    cardImage.className = classToBeAdded

    section.appendChild(cardImage)
}

function removeCard(){}