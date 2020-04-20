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

        io.in('game').emit('big-announcement', 'the game will start soon');

        // every client draws 4 cards at start of the game
        io.to(socket.id).emit('cards in hand', await drawCards(deck.deck_id, 4));
        
        socket.on('clicked card', (playedCard) => {
            io.in('game').emit('clicked card', playedCard)
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