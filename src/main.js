const host = window.location.hostname;
const port = window.location.port;
const protocol = window.location.protocol;
const wsProtocol = protocol === 'https:' ? 'wss' : 'ws';
const socket = new WebSocket(`${wsProtocol}://${host}:${port}/send`);

socket.onopen = () => {
    const name = document.getElementById('name').value;
    send({type: 'LOGIN', user: name});
    ping(socket)
};

socket.onmessage = e => {
    const message = JSON.parse(e.data);
    if (message.type === 'CHATMESSAGE'){
        insertMessage(message);
    } else if (message.type === 'LOGIN'){
        insertJoined(message)
    } else if (message.type === 'LOGOUT'){
        insertLeft(message)
    } else if (message.type === 'PINGPONG'){
        ping(socket)
    }
};

document.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault(); // prevents page reloading
    socket.send(JSON.stringify({
        type: 'CHATMESSAGE',
        user: name,
        content: document.getElementById('m').value
    }));
    document.getElementById('m').value = '';
    return false;
});

function escapeHtml(html) {
    const htmlEscapes = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;'
    };

    const htmlEscaper = /[&<>"'\/]/g;

    return ( '' + html ).replace ( htmlEscaper, function ( match ) {
        return htmlEscapes[ match ];
    } );
}

function ping (socket) {
    socket.send(JSON.stringify({
        type: 'PINGPONG',
        content:'PING'
    }));
}

function send(object) {
    socket.send(JSON.stringify(object));
}

function insertMessage (message) {
    const chatLog = document.querySelector('ul');
    chatLog.insertAdjacentHTML ( 'beforeend',
        `<li class="${message.source}">
                    <em>${escapeHtml(message.user)}</em>
                    <p>${escapeHtml(message.content)}</p>
                </li>` );
}

function insertJoined (message) {
    const chatLog = document.querySelector('ul')
    chatLog.insertAdjacentHTML('beforeend', `<li class="welcome">${escapeHtml(message.user)} has joined the chat</li>`);
}

function insertLeft (message) {
    const chatLog = document.querySelector('ul');
    chatLog.insertAdjacentHTML('beforeend', `<li class="welcome">${escapeHtml(message.user)} has left the chat</li>`);
}