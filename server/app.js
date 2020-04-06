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

const users = {}
const answers = []

app
    .use(express.static(path.join(__dirname, 'static')))
    .get('/', router.homeRoute)
    .get('/chat', router.chatRoute)

io.on('connection', (socket) => {
    // console.log('a user connected')

    socket.on('send-nickname', (nickname) => {
        users[socket.id] = nickname
        socket.broadcast.emit('user connected', nickname)
        // socket.nickname = nickname
        // if(nickname != null){
        // users.push(socket.nickname)
        // }
        console.log(users)
    })


    socket.on('chat message', (msg) => {
        console.log('message: ', msg)

        answers.push(msg)

        console.log('answers: ', answers)

        socket.broadcast.emit('chat message', {msg: msg, nickname: users[socket.id]})
    })

});

server.listen(port, () => {
    console.log(`Dev app listening on port: ${port}`)
})