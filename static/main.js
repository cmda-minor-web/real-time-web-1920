const host = window.location.hostname;
const port = window.location.port;
const socket = new WebSocket(`ws://${host}:${port}/send`);
const chatLog = document.querySelector('ul');
const name = document.getElementById('name').value;

socket.onopen = () => {
    socket.send(JSON.stringify({type: 'LOGIN', user: name}));
};

socket.onmessage = e => {
    const message = JSON.parse(e.data);
    if (message.type === 'CHATMESSAGE'){
        chatLog.insertAdjacentHTML ( 'beforeend',
            `<li class="${message.source}">
                    <em>${escapeHtml(message.user)}</em>
                    <p>${escapeHtml(message.content)}</p>
                </li>` );
    } else if (message.type === 'LOGIN'){
        chatLog.insertAdjacentHTML('beforeend', `<li class="welcome">${escapeHtml(message.user)} has joined the chat</li>`);
    } else if (message.type === 'LOGOUT'){
        chatLog.insertAdjacentHTML('beforeend', `<li class="welcome">${escapeHtml(message.user)} has left the chat</li>`);
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
