
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
    gameField.style.display = 'block'
    
})

// chatForm.addEventListener('submit', (event) => {
//     event.preventDefault()

//     if(message.value != ''){
//     appendMessage(`You: ${message.value}`, 'yourMessage')
//     socket.emit('chat message', message.value)
//     message.value = ''
//     }
    
// })


// socket.on('chat message', (msg) => {
//     appendMessage(msg, 'incomingMessage')
// })

// socket.on('user connected', (nickname) => {
//     appendMessage(nickname, 'serverNotification')
// })

// socket.on('server message', (msg) => {
//     appendMessage(msg, 'serverMessage')
// })

// socket.on('challenge', (word) => {
//     console.log(word)
//     appendMessage(word, 'serverMessage')
// })  


socket.on('your turn', (msg, cards) => {
    console.log('the message: ', msg)

    console.log('kaarta', cards)

    // const _listener = function(){

    //     findCard(this, cards)
    // }
    
    //event listener should be place here

    const cardsInHand = document.querySelectorAll('.card')

    //when card is clicked a broadcast to everyplayer needs to be sent
    // cardsInHand.forEach(card => card.addEventListener("mousedown", _listener, true))

    // cardsInHand.forEach(card => card.removeEventListener("mouseup", _listener, true))

    const onClick = function() {
        findCard(this, cards)
        cardsInHand.forEach(card => {
          card.removeEventListener('click', onClick);
        });
      };
      
      cardsInHand.forEach(card => {
        card.addEventListener('click', onClick);
      });

})


socket.on('deal cards', (cards, turn) => {
    // socket.on('pass turn', (player) => console.log('rukkeee:', player))
    console.log('caards: ', cards)
    console.log('my turn: ', turn)
    // console.log('playa: ', playa)

    cards.cards.forEach(card => {
        
        appendCard(cardsSection, card.image, 'card')
        
    });



    // event listener in aparte

// const cardsInHand = document.querySelectorAll('.card')

// //when card is clicked a broadcast to everyplayer needs to be sent
// cardsInHand.forEach(card => {
    
//     card.addEventListener('click', (event) => {

//         findCard(event, cards)

//     })
// })


})

socket.on('clicked card', (card, cards) => {
    console.log('clicked card: ', card)
    //Now append the card to the playfield
    

    appendCard(gameField, card.image, 'playedCard')

})



socket.on('winner', (winner) => {

    console.log('the winner is: ', winner)

    // appendMessage(winner, 'winnerMessage')
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

function findCard(ev, cards){
    
    

    const clickedCard = ev.src


    console.log('from find card: ', findCardInArray(cards, clickedCard))
    // let findCard = cards.cards.find(card => card.image === clickedCard)

    socket.emit('pass turn')
    
    socket.emit('clicked card', findCardInArray(cards, clickedCard), cards)
    // console.log('maaaa', console.log(indexOf(findCard)))
    // gameField.appendChild(event.target)
    // console.log(findCard)

    // clickedCard.remove()

    ev.remove()

}

function findCardInArray(array, cardToBeFound){
    
    return foundCard = array.cards.find(card => card.image === cardToBeFound)

}