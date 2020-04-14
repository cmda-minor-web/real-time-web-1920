const express = require('express');
const app = express();
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
  findQuotes(db)
})

const findQuotes = function(db) {
  const collection = db.collection('quotes');
  collection.find({}).toArray(function(err, docs) {
    console.log("Found the following records");
    console.log(docs)
  });
}


app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
  res.render('index', {});
});


io.on('connection', function(socket) {


  socket.on('user_join', function(data) {
    this.username = data
    socket.broadcast.emit('user_join', data)
  })

  socket.on('chat_message', function(data) {
    data.username = this.username
    socket.broadcast.emit('chat_message', data)
    const message = data.message
    checkMessage(message)

  })

  socket.on('disconnect', function(data) {
    socket.broadcast.emit('user_leave', this.username)
  })
})


function checkMessage(message) {
  const addquote = "/addquote" || ".addquote"
  if (message.includes(addquote)) {
    console.log("gooiquote")
  }
   else {
    console.log("niets")
  }
}

http.listen(port, function() {
  console.log('App listening on: ' + port)
})
