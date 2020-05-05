const tweets = document.querySelector(".tweets")
const socket = io()

socket.on("new_tweet", function(tweet) {
  addTweet(tweet)
  socket.emit("refresh_tweet", tweet)
})

let zoeken = 'jeffreestar'

socket.emit("start", zoeken)


function addTweet(tweet) {
  const li = document.createElement("li")
  li.innerHTML = tweet
  tweets.appendChild(li)
  window.scrollTo(0, document.body.scrollHeight)
}