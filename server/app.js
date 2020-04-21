require('dotenv').config()
const nunjucks = require('nunjucks')
const router = require('./routes/router.js')
const path = require('path')
const ioClient = require('socket.io-client')
const port = process.env.PORT || 3000
const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const fetch = require('node-fetch')




async function getNewCardDeck(){
    const getCards = await fetch('https://deckofcardsapi.com/api/deck/new/shuffle')

    const cards = await getCards.json()

    return cards
}

getNewCardDeck()
    .then(getNewCardDeck => gameMaker(getNewCardDeck))

async function drawCards(id, count){
    const getCards = await fetch(`https://deckofcardsapi.com/api/deck/${id}/draw/?count=${count}`)

    const cards = await getCards.json()

    return cards
}

async function cardPiles(id, pileName, cardsToAdd){
    const pile = await fetch(`https://deckofcardsapi.com/api/deck/${id}/pile/${pileName}/add/?cards=${cardsToAdd}`)

    const piles = await pile.json()

    return piles
}

async function pileList(id, pileName){
    const pile = await fetch(`https://deckofcardsapi.com/api/deck/${id}/pile/${pileName}/list/`)

    const piles = await pile.json()

    return piles

}


const words = [
    {
        word: 'Running',
        size: 10
    },
    {
        word: 'Skateboarding',
        size: 10
    }
]


nunjucks.configure(`${__dirname}/view/pages`, {
    autoescape: true,
    express: app
});


const users = []
let connectCounter = 0


function countInArray(array, what) {
    return array.filter(item => item == what).length;
}

function findUser(array, socket){
    return array.find(user => user.id == socket.id)
}

app
    .use(express.static(path.join(__dirname, 'static')))
    .get('/', router.homeRoute)
    .get('/chat', router.chatRoute)

function gameMaker(deck){
    
io.on('connection', (socket) => {

    //step1: first make a room
    socket.join('game', async () => {
        let rooms = Object.keys(socket.rooms);
        // console.log(rooms)

        // if more than 4 players make new room
        const clients = io.sockets.adapter.rooms['game'].length

         console.log(clients)

        io.in('game').emit('big-announcement', 'the game will start soon');

        const drawnCards = await drawCards(deck.deck_id, 4)

        // every client draws 4 cards at start of the game
        io.to(socket.id).emit('cards in hand', drawnCards);

        // console.log(lef.cards[0].code)

        // console.log(drawnCards.cards.map(d => d.code))

        // const pile = await cardPiles(deck.deck_id, 'player', drawnCards.cards.map(d => d.code))

        
        
        // console.log('piiilee: ', pile)
        
        socket.on('clicked card', async (playedCard, cards) => {
            
            console.log(playedCard)

            const toBeRemovedFromHand = cards.cards.findIndex(card => card.code == playedCard.code)

            cards.cards.splice(toBeRemovedFromHand, 1)

            console.log('kaart gespeelt: ', cards)

            console.log('cards in hand: ', cards)

            const drawnCard = await drawCards(deck.deck_id, 1)

            console.log('you wnat: ', drawnCard)

            cards.cards.push(drawnCard.cards[0])

            console.log('with drawn card: ', cards)

            io.in('game').emit('clicked card', playedCard, cards)
        })
        

        // io.in('game').emit('show played card', 'the game will start soon');
        // socket.on('play card', )
        
    })


    //step 2: whem players are in the room get a new card deck

    const user = () => users.find(user => user.id == socket.id)

    let randomWord = words[Math.floor(Math.random() * words.length)]

    socket.on('send-nickname', async(nickname) => {

        users.push({id: socket.id, name: nickname, answers: []})
        
        socket.broadcast.emit('user connected', `${user().name} entered the room`)
        connectCounter++
        
        if(connectCounter === 2){
            
            
            users.forEach(async user => {
                // const deck = await drawCards()
                // socket.broadcast.to(user.id).emit('challenge', await drawCards())
            });
            
        }

    })

    socket.on('disconnect', () => {

         if(user() !== undefined) {
            socket.broadcast.emit('server message', `${user().name} has left the chat`)
            connectCounter--
        }
                
    })

    socket.on('chat message', (msg) => {

        if(user().id == socket.id){
            user().answers.push(msg)
            let keepCount = countInArray(user().answers, randomWord.word)
            console.log('keepCount:', keepCount)
            if(keepCount === randomWord.size) io.sockets.emit('winner', `${user().name} won the game!`)
        }
        
        console.log('users saving answers: ', users)

        socket.broadcast.emit('chat message', `${user().name}: ${msg}`)
    }) 

});
}

server.listen(port, () => {
    console.log(`Dev app listening on port: ${port}`)
})