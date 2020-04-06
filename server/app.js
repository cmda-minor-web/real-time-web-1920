require('dotenv').config()
const nunjucks = require('nunjucks')
const router = require('./routes/router.js')
const path = require('path')
const port = process.env.PORT || 3000
const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)


nunjucks.configure(`${__dirname}/view/pages`, {
    autoescape: true,
    express: app
});



app
    .use(express.static(path.join(__dirname, 'static')))
    .get('/', router.homeRoute)

io.on('connection', (socket) => {
    console.log('a user connected')

    socket.on('chat message', (msg) => {
        console.log('message: ', msg)
        io.emit('chat message', msg)
    })

});

server.listen(port, () => {
    console.log(`Dev app listening on port: ${port}`)
})