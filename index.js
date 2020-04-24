const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const { MongoClient } = require("mongodb");


require('dotenv').config()

const port = process.env.PORT
const url = process.env.MNG_URL
const dbName = process.env.DB_NAME
const client = new MongoClient(url)

 async function run() {
    try {
         await client.connect();
         console.log("Connected correctly to server");
         const db = client.db(dbName);

         const col = db.collection("chat_quote_list");

         let quote = {
             "quote": "look at all those chickens"
         }

         // Insert a single document, wait for promise so we can read it back
         const p = await col.insertOne(quote);
         // Find one document
         const myDoc = await col.findOne();
         // Print to the console
         console.log(myDoc);

        } catch (err) {
         console.log(err.stack);
     }

     finally {
        await client.close();
    }
}

run().catch(console.dir);


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
      addQuote(message)
    }
    else if (message.includes(quote)) {
      // console.log("getQuote")
      getQuote()
    }
     else {
    }
  }




  function getQuote() {
    console.log("quote ophalen")
    const oneQuote = quotes.aggregate([{$sample:{size:1}}])

    oneQuote.toArray(function(err, docs) {
      console.log(oneQuote)
      // const oneQuote = docs[0].name
      // console.log(oneQuote)
      // socket.emit("chat_quote", oneQuote)
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
