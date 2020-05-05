const tweets = document.querySelector(".tweets")
const socket = io()

socket.on("new_tweet", function(user, tweet) {
  console.log('main' + user)
  console.log('main' + tweet)

  addTweet(tweet)
  socket.emit("refresh_tweet", tweet)
})

let zoeken = 'jeffreestar'
let ding = 'hehehe'

socket.emit("start", zoeken, ding)


function addTweet(tweet) {
  const li = document.createElement("li")
  li.innerHTML = tweet
  tweets.appendChild(li)
  window.scrollTo(0, document.body.scrollHeight)
}