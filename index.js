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

  socket.on('chat_quote', function(docs) {
    socket.broadcast.emit('chat_quote', docs)
  })

  socket.on('disconnect', data => {
    socket.broadcast.emit('user_leave', this.username)
  })

  function checkMessage(message) {
    const addquote = "/addquote" || ".addquote"
    const quote = "/quote" || ".quote"
    if (message.includes(addquote)) {
      console.log("addQuote")
      addQuote(db, message)
    }
    else if (message.includes(quote)) {
      console.log("getQuote")
      getQuotes(db)
    }
     else {

    }
  }

  function getQuotes(db) {
    const collection = db.collection('quotes')
    const oneQuote = db.collection('quotes').aggregate([{$sample:{size:1}}])

    oneQuote.toArray(function(err, docs) {
      const oneQuote = docs[0].name
      console.log(oneQuote)
      socket.emit("chat_quote", oneQuote)
    })
  }


    function addQuote(db, message) {
      const quote = message.substring(9)
      const cleanQuote = quote.trim()


      const collection = db.collection('quotes')
      collection.insertOne( { name: cleanQuote} )
      socket.emit("chat_quote", `Added "${cleanQuote}". I'm amazing, right?`)
    }

})



http.listen(port, () => {
  console.log('App listening on: ' + port)
})
