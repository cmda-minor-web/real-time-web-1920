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

app.use(express.static('public'))
app.set('view engine', 'ejs')

app.get('/', function(req, res) {
  res.render('index', {})
  // console.log("test")
})


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
      toevoegen(message)
    } else if (message.includes(quote)) {
      console.log("getQuote")
      pakken()
    } else {}
  }


  async function toevoegen(message) {
    const cleanQuote = message.substring(10).trim()
    const quote = {
      "quote": cleanQuote
    }

    const client = await MongoClient.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    const db = client.db(dbName)
    console.log("Connected correctly to server")
    const item = await db.collection('chat_quote_list').insertOne(quote)
    client.close();
    socket.emit("chat_quote", `Added "${cleanQuote}". I'm an amazing bot, right?`)

  }


  async function pakken() {
    const client = await MongoClient.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    const db = client.db(dbName)
    console.log("Connected correctly to server")
    const quote = await db.collection('chat_quote_list').aggregate([{
      $sample: {
        size: 1
      }
    }]).toArray()
    console.log(quote);
    socket.emit("chat_quote", quote[0].quote)

    client.close()
  }



  // function connectie () {
  //   const client = new MongoClient(url, {useUnifiedTopology: true})
  //   client.connect()
  // }

  // async function run(trigger, message) {
  //   try {
  //     const client = new MongoClient(url, {
  //       useUnifiedTopology: true
  //     })
  //     await client.connect()
  //     const db = client.db(dbName)
  //     const col = db.collection("chat_quote_list")
  //     console.log("Connected correctly to server")
  //
  //     if (trigger == "addQuote") {
  //       const quote = message.substring(10)
  //       const cleanQuote = quote.trim()
  //       const finalQuote = {
  //         "quote": cleanQuote
  //       }
  //       const p = await col.insertOne(finalQuote)
  //       socket.emit("chat_quote", `Added "${cleanQuote}". I'm amazing, right?`)
  //       await client.close()
  //     } else if (trigger == "getQuote") {
  //       console.log("quote pakken")
  //       // const findQuote = await col.findOne()
  //
  //       // const findQuote = await col.aggregate([{$sample:{size:1}}])
  //       // const iets = await col.find()
  //       const oneQuote = col.find({
  //         _id: 5
  //       })
  //
  //
  //       // console.log(findQuote)
  //       // const oneQuote = findQuote.quote
  //       console.log(oneQuote)
  //       // { $sample: { size: 2 } }
  //       socket.emit("chat_quote", oneQuote)
  //       await client.close()
  //
  //       // const oneQuote = await col.aggregate([{$sample:{size:1}}])
  //       // const oneQuote = await col.aggregate(
  //       //    [ { $sample: { size: 2 } } ]
  //       // )
  //       //
  //       // const testt = oneQuote.quote
  //       //  console.log(testt)
  //       //
  //       //  const test2 = oneQuote[0]
  //       //  console.log(test2)
  //       //
  //       //  const test3 = oneQuote[0].quote
  //       //  console.log(test3)
  //
  //
  //       // oneQuote.toArray(function(err, docs) {
  //       //   console.log(oneQuote)
  //       // //   const oneQuote = docs[0].name
  //       // //   // console.log(oneQuote)
  //       // //   socket.emit("chat_quote", oneQuote)
  //       // })
  //     }
  //
  //   } catch (err) {
  //     console.log(err)
  //   }
  //   // finally {
  //   // }
  // }

  // function getQuote() {
  //   console.log("quote ophalen")
  //   const oneQuote = quotes.aggregate([{$sample:{size:1}}])
  //
  //   oneQuote.toArray(function(err, docs) {
  //     console.log(oneQuote)
  //     const oneQuote = docs[0].name
  //     // console.log(oneQuote)
  //     socket.emit("chat_quote", oneQuote)
  //   })
  // }


  //     function addQuote(db, message) {
  //       const quote = message.substring(9)
  //       const cleanQuote = quote.trim()
  //
  //
  //       const collection = db.collection('quotes')
  //       collection.insertOne( { name: cleanQuote} )
  //       socket.emit("chat_quote", `Added "${cleanQuote}". I'm amazing, right?`)
  //     }
  //
})



http.listen(port, () => {
  console.log('App listening on: ' + port)
})