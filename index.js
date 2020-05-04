const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const {
  MongoClient
} = require("mongodb")


require('dotenv').config()

const port = process.env.PORT
const url = process.env.MNG_URL
const dbName = process.env.DB_NAME

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}

app.use(express.static('public'))
app.set('view engine', 'ejs')

app.get('/', function(req, res) {
  res.render('index', {})
})


io.on('connection', socket => {

  socket.on('user_join', data => {
    console.log("hallo")
  })

  socket.on('chat_message', data => {
    console.log("chatmessage")
  })

  socket.on('disconnect', data => {
    console.log("closed window")
  })
})

http.listen(port, () => {
  console.log('App listening on: ' + port)
})