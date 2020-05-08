const tweets1 = document.querySelector(".tweets1")
const socket = io()
const searchBar_1 = document.querySelector(".header_nav_searchBar_1")
const input1 = document.querySelector(".header_nav_searchBar_1_textInput")
const tweets1_tweet_text = document.querySelector(".tweets1_tweet_text")
const username_1 = "James Charles"
const username_2 = "Tati Westbrook"
const username_1followers_count = 20;
const username_2followers_count = 300;

searchBar_1.addEventListener("submit", function(event) {
  event.preventDefault()
  // when searching for another username, delete the results of the previous search
  while (tweets1.firstChild) {
    tweets1.removeChild(tweets1.firstChild);
  }

  const username_1 = input1.value
  socket.emit("start", username_1)

  input1.value = ""
  return false
}, false)


socket.on("new_tweet", function(username, tweet) {
  // res.render('index.ejs', {
  //   username_1: username
  // })
  addTweet1(username, tweet)
  socket.emit("refresh_tweet", username, tweet)
})

socket.on("new_followers", function(username, followers) {
  addFollower(followers)
  socket.emit("refresh_tweet", username, tweet)
})

function addTweet1(username, tweet) {
  const username_1 = document.querySelector(".main_user_1_name")
  username_1.innerHTML = username

  const li = document.createElement("li")
  li.innerHTML = tweet
  tweets1.appendChild(li)
  // window.scrollTo(tweet)
  window.scrollTo(0, tweets.scrollHeight)

}

function addFollower(followers) {
  console.log(followers)
}

function calculateWinning() {
  if (username_1.followers_count > username_2.followers_count) {
    const username_1_color = '#1DA1F2'
    const username_2_color = '#657786'
  } else {
    const username_2_color = '#1DA1F2'
    const username_1_color = '#657786'
  }
}


let ctx = document.getElementById("myChart")

var data = {
  labels: [username_1, username_2],
  datasets: [{
    barThickness: '80px',
    data: [username_1followers_count, username_2followers_count],
    backgroundColor: [
      '#657786',
      '#AAB8C2'
    ],
    borderColor: [
      '#E1E8ED',
      '#E1E8ED'
    ],
    borderWidth: [2, 2]
  }]
}

var myChart = new Chart(ctx, {
  type: 'bar',
  data: data,
  options: {
    responsive: true,
    "hover": {
      "animationDuration": 0
    },
    "animation": {
      "duration": 1,
      "onComplete": function showFollowers() {
        var chartInstance = this.chart
        ctx = chartInstance.ctx
        ctx.textAlign = 'center'
        ctx.textBaseline = 'bottom'

        this.data.datasets.forEach(function(dataset, i) {
          var meta = chartInstance.controller.getDatasetMeta(i)
          meta.data.forEach(function(bar, index) {
            var data = dataset.data[index];
            ctx.fillText(data, bar._model.x, bar._model.y - 5)
          })
        })
      }
    },
    legend: {
      "display": false
    },
    tooltips: {
      "enabled": true
    },
    scales: {
      yAxes: [{
        display: false,
        gridLines: {
          display: false
        },
        ticks: {
          max: Math.max(...data.datasets[0].data) + 40,
          display: true,
          beginAtZero: true,
        }
      }],
      xAxes: [{
        gridLines: {
          display: false
        },
        ticks: {
          beginAtZero: true,
          display: true
        }
      }]
    }
  }
})