const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const {
  MongoClient
} = require("mongodb")
const Twitter = require('twitter')


require('dotenv').config()

const port = process.env.PORT
const url = process.env.MNG_URL
const dbName = process.env.DB_NAME
const twitterClient = new Twitter({
  consumer_key: process.env.TWITTER_API_KEY,
  consumer_secret: process.env.TWITTER_API_SECRET_KEY,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
})
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}
const filterOptions = {
  screen_name: 'jeffreestar',
  count: 1
}

app.use(express.static('public'))
  .set('view engine', 'ejs')
  .get('/', function(req, res) {
    res.render('index', {})
  })


io.on('connection', socket => {

  socket.on("start", () => {
    getTweet()
  })

  socket.on('new_tweet', data => {
    socket.broadcast.emit('new_tweet', data)
  })

  socket.on('refresh_tweet', latest_tweet => {
    getTweet(latest_tweet)
  })
})


function getTweet(latest_tweet) {
  const getData = new Promise((resolve) => {
    twitterClient.get('statuses/user_timeline', filterOptions, function(err, data) {
      const tweets = data.map((item) => {
        // console.log(item.user.followers_count)
        const tweet = item.text
        return tweet
      })
      const tweet = tweets[0]
      resolve(tweet)
    })
  })

  getData
    .then(tweet => {
      if (tweet === latest_tweet) {
        console.log('same old')
        refreshTweet(tweet)
      } else {
        console.log('sunshine and rainbows: new tweet!')
        io.emit("new_tweet", tweet)
      }
    })
    .catch(err => {
      console.log(err)
    })
}

function refreshTweet(latest_tweet) {
  getTweet(latest_tweet)
}

http.listen(port, () => {
  console.log('App listening on: ' + port)
})