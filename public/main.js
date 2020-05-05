const tweets = document.querySelector(".tweets")
const socket = io()

socket.on("new_tweet", function(tweet) {
  console.log('zeven')
  addTweet(tweet)
  socket.emit("refresh_tweet", 'yeet')
})


socket.emit("start", 'hallo')


function addTweet(tweet) {
  const li = document.createElement("li")
  li.innerHTML = tweet
  tweets.appendChild(li)
  window.scrollTo(0, document.body.scrollHeight)
}