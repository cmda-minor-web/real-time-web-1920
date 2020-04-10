const socket = io();
(function() {
  console.log('iife');
  document.querySelector('form').addEventListener('submit', function(e) {
    console.log('submitted');
    e.preventDefault();
    socket.emit('chat message', document.querySelector('#m').value);
    document.querySelector('#m').value = "";
    return false;
  });
  socket.on('chat message', function(msg) {
    const newLi = document.createElement("li")
    newLi.textContent = msg
    document.querySelector('#messages').append(newLi);
  });
})();