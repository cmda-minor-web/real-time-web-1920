const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const MongoClient = require('mongodb').MongoClient
const url = 'mongodb://127.0.0.1:27017'


const port = process.env.PORT || 3000

const dbName = 'chat-quote-list'
let db

MongoClient.connect(url, {
  useNewUrlParser: true
}, (err, client) => {
  if (err) return console.log(err)

  // Storing a reference to the database so you can use it later
  db = client.db(dbName)
  console.log(`Connected MongoDB: ${url}`)
  console.log(`Database: ${dbName}`)
})

app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
  res.render('index', {});
});


io.on('connection', socket => {

  socket.on('user_join', data => {
    this.username = data
    socket.broadcast.emit('user_join', data)
  })

  socket.on('chat_message', data => {
    data.username = this.username
    socket.broadcast.emit('chat_message', data)
    const message = data.message
    checkMessage(message)
  })

  // socket.on('chat_quote', function(docs) {
  //   console.log('test')
  //   socket.broadcast.emit(docs[0])
  // })

  socket.on('disconnect', data => {
    socket.broadcast.emit('user_leave', this.username)
  })

  function checkMessage(message) {
    const addquote = "/addquote" || ".addquote"
    const quote = "/quote" || ".quote"
    if (message.includes(addquote)) {
      console.log("addQuote")
    }
    else if (message.includes(quote)) {
      console.log("getQuote")
      getQuotes(db)
    }
     else {
      console.log("niets")
    }
  }

  function getQuotes(db) {
    const collection = db.collection('quotes')
    collection.find({}).toArray(function(err, docs) {
      console.log("Found the following records")
      console.log(docs)
      socket.emit("chat_quote", docs[3].name)

    })
  }

})



http.listen(port, () => {
  console.log('App listening on: ' + port)
})
