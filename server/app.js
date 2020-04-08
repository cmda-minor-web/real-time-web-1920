require('dotenv').config()
const nunjucks = require('nunjucks')
const router = require('./routes/router.js')
const path = require('path')
const port = process.env.PORT || 3000
const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

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

io.on('connection', (socket) => {

    const user = () => users.find(user => user.id == socket.id)

    let randomWord = words[Math.floor(Math.random() * words.length)]

    socket.on('send-nickname', (nickname) => {

        users.push({id: socket.id, name: nickname, answers: []})
        
        socket.broadcast.emit('user connected', `${user().name} entered the room`)
        connectCounter++
        
        if(connectCounter === 2){
            io.sockets.emit('challenge', `The word is: ${randomWord.word}`)
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

server.listen(port, () => {
    console.log(`Dev app listening on port: ${port}`)
})