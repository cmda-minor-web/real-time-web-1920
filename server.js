const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const {
  MongoClient
} = require("mongodb")
const Twitter = require('twitter')
let username_1 = "Twitter user 1"
let username_2 = "Twitter user 2"


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


app.use(express.static('./public'))
app.set('view engine', 'ejs')
app.set('views', './views')
app.get('/', function(req, res) {
  res.render('index.ejs', {
    username_1: username_1,
    username_2: username_2
  })
})

io.on('connection', socket => {

  socket.on("start", function(username) {
    getInfo(username, '')
  })

  socket.on('new_tweet', function(username, tweet) {
    socket.broadcast.emit('new_tweet', username, tweet)
  })

  socket.on('new_follower', function(username, followers) {
    socket.broadcast.emit('new_follower', username, followers)
  })

  socket.on('refresh_tweet', function(username, latest_tweet) {
    getInfo(username, latest_tweet)
  })
})


function getInfo(username, latest_tweetObject) {
  const filterOptions = {
    screen_name: username,
    count: 1
  }

  const getData = new Promise((resolve) => {
    twitterClient.get('statuses/user_timeline', filterOptions, function(err, data) {
      const tweets = data.map(item => ({
        text: item.text,
        user_name: item.user.name,
        user_screen_name: item.user.screen_name,
        followers: item.user.followers_count
      }))
      const tweetObject = tweets[0]
      resolve(tweetObject)
    })
  })

  getData
    .then(tweetObject => {
      // const tweetText = tweet.text
      checkText(username, tweetObject, latest_tweetObject)
    })
    .catch(err => {
      console.log(err)
    })
}

function checkText(username, tweetObject, latest_tweetObject) {
  const tweetText = tweetObject.text
  const latest_tweetText = latest_tweetObject.text

  if (tweetText == latest_tweetText) {
    console.log('same old')
    refreshTweet(username, tweetObject, tweetText)
  } else {
    console.log('sunshine and rainbows: new tweet!')
    // io.emit("new_tweet", username, tweetText)
  }
}

function checkFollowers(username, followers, latest_followers) {
  if (followers == latest_followers) {
    console.log('same old fam')
    refreshTweet(username, followers)
  } else {
    console.log('new follower count!')
    io.emit("new_tweet", username, followers)
  }
}



function refreshTweet(username, tweetObject, latest_tweet) {
  getInfo(username, latest_tweet)
}

http.listen(port, () => {
  console.log('App listening on: ' + port)
})