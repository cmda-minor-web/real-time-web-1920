const app = require('express')()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const port = process.env.PORT || 3000


app.get('/', function(req, res) {
  res.sendFile(__dirname + '/src/index.html')
})

io.on('connection', function(socket) {
  console.log('a user connected')
})

http.listen(3000, function() {
  console.log(`Example app listening on port ${port}!`)
})