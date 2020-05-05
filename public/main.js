const tweets = document.querySelector(".tweets")
const socket = io()
const searchForm = document.querySelector(".searchForm")
const input = document.querySelector(".input")

<<<<<<< HEAD
searchForm.addEventListener("submit", function(event) {
  event.preventDefault()
  // when searching for another username, delete the results of the previous search
  while (tweets.firstChild) {
    tweets.removeChild(tweets.firstChild);
  }

  const username = input.value
  socket.emit("start", username)

  input.value = ""
  return false
}, false)

=======
socket.on("new_tweet", function(user, tweet) {
  console.log('main' + user)
  console.log('main' + tweet)

  addTweet(tweet)
  socket.emit("refresh_tweet", tweet)
})

let zoeken = 'jeffreestar'
let ding = 'hehehe'

socket.emit("start", zoeken, ding)
>>>>>>> ee59f7a3c67201dce7a87bd969502ee41ac79353


socket.on("new_tweet", function(username, tweet) {
  addTweet(tweet)
  socket.emit("refresh_tweet", username, tweet)
})

function addTweet(tweet) {
  const li = document.createElement("li")
  li.innerHTML = tweet
  tweets.appendChild(li)
  window.scrollTo(0, document.body.scrollHeight)
}