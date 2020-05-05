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

const options2 = {
  screen_name: 'alldayoptimism',
  count: 1
}

io.on('connection', socket => {

  socket.on("start", data => {
    console.log('twee')
    console.log(data)
    getTweet()
  })

  socket.on('new_tweet', data => {
    console.log('zes')
    socket.broadcast.emit('new_tweet', data)
    // getTweet()
  })

  socket.on('refresh_tweet', data => {
    console.log(data)
    console.log("elf")
    // io.emit("new_tweet", tweet)
    getTweet()
  })
})



function getTweet() {
  console.log('drie')
  const getData = new Promise(resolve => {
    client.get('statuses/user_timeline', options2, function(err, data) {
      const tweets = data.map(function(item) {
        // console.log(item.user.followers_count)
        const tweet = item.text
        return tweet
      })
      const tweet = tweets[0]
      console.log('vier')
      resolve(tweet)
    })
  })

  getData.then(tweet => {
      console.log('vijf')
      io.emit("new_tweet", tweet)
    })
    .then(() => {
      console.log('negen')
      refreshTweet()
    })
}

function refreshTweet() {
  console.log('tien')
  const data = 'yeet'
  io.emit("refresh_tweet", data)

}





async function getTwet() {
  const help = await client.get('statuses/user_timeline', options2, function(err, data) {
    const tweets = data.map(function(item) {
      const tweet = item.text
      return tweet
    })
    const tweet = tweets[0]
    // const tweet2 = tweets[1]
    // const tweet3 = tweets[2]
    // console.log("test1" + tweet)
    console.log(tweet)
    return tweet
    // io.emit("new_tweet", tweet2)
    // io.emit("new_tweet", tweet3)

    // io.emit("new_tweet", tweet1)
  })
  // console.log(help)
  // const tweet = help..
  // io.emit("new_tweet", tweet)

}
//
// var options2 = {
//   track: 'javascript'
//   // count: 3
// };

//
// client.stream('statuses/filter', options2, function(stream) {
//   stream.on('data', function(data) {
//     console.log(data)
//
//     // console.log(tweet.text)
//     // const data = tweet.text
//     // io.emit("new_tweet", data)
//   })
//
//   stream.on('error', function(error) {
//     console.log(error)
//   })
// })

//
// client.stream('statuses/user_timeline', {
//   screen_name: 'jeffreestar',
//   count: 5
// }, function(stream) {
//   stream.on('data', function(tweet) {
//
//     console.log(tweet)
//     console.log(tweet.text)
//     const data = tweet.text
//     io.emit("new_tweet", data)
//   })
//
//   stream.on('error', function(error) {
//     console.log(error)
//   })
// })

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