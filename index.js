const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const {
  MongoClient
} = require("mongodb")
const fetch = require('node-fetch')
const Twitter = require('twitter')


require('dotenv').config()

const port = process.env.PORT
const url = process.env.MNG_URL
const dbName = process.env.DB_NAME

const client = new Twitter({
  consumer_key: process.env.TWITTER_API_KEY,
  consumer_secret: process.env.TWITTER_API_SECRET_KEY,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
})


// const apiKey = process.env.TWITTER_API_KEY
// const apiSecretKey = process.env.TWITTER_API_SECRET_KEY
// const apiAccessToken = process.env.TWITTER_ACCESS_TOKEN
// const apiSecretAccessToken = process.env.TWITTER_ACCESS_TOKEN_SECRET

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}

app.use(express.static('public'))
app.set('view engine', 'ejs')

app.get('/', function(req, res) {
  // Api.get().then(data => {
  res.render('index', {})
  // })
})


io.on('connection', socket => {

  socket.on('new_tweet', data => {
    socket.broadcast.emit('new_tweet', data)
  })


})


client.stream('statuses/filter', {
  track: 'javascript'
}, function(stream) {
  stream.on('data', function(tweet) {
    console.log(tweet.text)
    const data = tweet.text
    io.emit("new_tweet", data)
  })

  stream.on('error', function(error) {
    console.log(error)
  })
})

// const endpoint = "https://api.twitter.com/1.1/users/show.json?screen_name=jeffreestar"


// const Api = {
//   get() {
//     return fetch(endpoint)
//       .then(res => res.json())
//       .then((json) => {
//         console.log(json)
//         return json
//       })
//       .catch(err => {
//         console.log(err)
//       })
//   }
// }

http.listen(port, () => {
  console.log('App listening on: ' + port)
})