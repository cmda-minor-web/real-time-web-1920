init();
function init() {
    const host = window.location.hostname;
    const port = window.location.port;
    const protocol = window.location.protocol;
    const wsProtocol = protocol === 'https:' ? 'wss' : 'ws';
    const socket = new WebSocket ( `${ wsProtocol }://${ host }:${ port }/send` );

    socket.onopen = () => {
        const name = document.getElementById ( 'name' ).value;
        send ( { type: 'LOGIN', user: name } );
        ping ( socket );
    };

    socket.onmessage = e => {
        const message = JSON.parse ( e.data );
        if ( message.type === 'CHATMESSAGE' ) {
            insertMessage ( message );
        } else if ( message.type === 'LOGIN' ) {
            insertJoined ( message )
        } else if ( message.type === 'LOGOUT' ) {
            insertLeft ( message )
        } else if ( message.type === 'DRAW' ) {
            renderDrawing ( message )
        } else if ( message.type === 'PINGPONG' ) {
            ping ( socket )
        }
    };

    document.querySelector ( 'form' ).addEventListener ( 'submit', ( e ) => {
        e.preventDefault (); // prevents page reloading
        socket.send ( JSON.stringify ( {
            type: 'CHATMESSAGE',
            user: name,
            content: document.getElementById ( 'm' ).value
        } ) );
        document.getElementById ( 'm' ).value = '';
        return false;
    } );

    function escapeHtml ( html ) {
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

    function ping ( socket ) {
        socket.send ( JSON.stringify ( {
            type: 'PINGPONG',
            content: 'PING'
        } ) );
    }

    function send ( object ) {
        window.setTimeout ( () => {
            socket.send ( JSON.stringify ( object ) );
        }, 1000 );
    }

    function insertMessage ( message ) {
        const chatLog = document.querySelector ( 'ul' );
        if ( message.content === '/draw' ) {
            const canvas = document.createElement ( 'canvas' ),
                item = document.createElement ( 'li' ),
                name = document.createElement ( 'em' );
            name.innerHTML = `<img src="https://unavatar.now.sh/github/${ message.user }" alt="Unavatar avatar">${ escapeHtml ( message.user ) }`;
            canvas.setAttribute ( 'width', 400 );
            canvas.setAttribute ( 'height', 300 );
            canvas.itemId = message.id;
            item.classList.add ( message.source );
            item.setAttribute ( 'id', `c${ message.id }` );
            item.append ( name, canvas );
            chatLog.insertAdjacentElement ( 'beforeend',
                item );
            if ( message.source === 'own' ) enableDrawing ( canvas );
        } else {
            chatLog.insertAdjacentHTML ( 'beforeend',
                `<li id="c${ message.id }" class="${ message.source }">
                    <em><img src="https://unavatar.now.sh/github/${ message.user }" alt="Unavatar avatar">${ escapeHtml ( message.user ) }</em>
                    <p>${ escapeHtml ( message.content ) }</p>
                </li>` );
        }
    }

    function insertJoined ( message ) {
        const chatLog = document.querySelector ( 'ul' )
        chatLog.insertAdjacentHTML ( 'beforeend', `<li class="welcome">${ escapeHtml ( message.user ) } has joined the chat</li>` );
    }

    function insertLeft ( message ) {
        const chatLog = document.querySelector ( 'ul' );
        chatLog.insertAdjacentHTML ( 'beforeend', `<li class="welcome">${ escapeHtml ( message.user ) } has left the chat</li>` );
    }

    function renderDrawing ( message ) {
        const canvas = document.querySelector ( `#c${ message.canvas } canvas` );
        const ctx = canvas.getContext ( '2d' );
        const img = new Image;
        img.onload = function () {
            ctx.drawImage ( img, 0, 0 ); // Or at whatever offset you like
        };
        img.src = message.data;
    }

    //From example at https://dev.opera.com/articles/html5-canvas-painting/
    function enableDrawing ( canvas ) {
        const pencil = new Pencil ();
        if ( !canvas ) {
            console.error ( 'Failed to get Canvas element' );
            return;
        } else if ( !canvas.getContext ) {
            console.error ( 'Failed canvas.getContext' );
            return;
        }
        const ctx = canvas.getContext ( '2d' );
        if ( !ctx ) {
            console.error ( 'Failed to get Context' );
            return;
        } else if ( !pencil ) {
            console.error ( 'Failed to get pencil' );
            return;
        }

        canvas.addEventListener ( 'mousedown', ( e ) => {
            canvasEvents ( e )
        }, false );
        canvas.addEventListener ( 'mousemove', ( e ) => {
            canvasEvents ( e )
        }, false );
        canvas.addEventListener ( 'mouseup', ( e ) => {
            canvasEvents ( e )
        }, false );
        canvas.addEventListener ( 'mouseleave', ( e ) => {
            canvasEvents ( e )
        }, false );
        canvas.addEventListener ( 'touchstart', ( e ) => {
            canvasEvents ( e )
        }, false );
        canvas.addEventListener ( 'touchmove', ( e ) => {
            canvasEvents ( e )
        }, false );
        canvas.addEventListener ( 'touchend', ( e ) => {
            canvasEvents ( e )
        }, false );

        function Pencil () {
            this.started = false;
            this.mousedown = e => {
                ctx.beginPath ();
                ctx.moveTo ( e._x, e._y );
                this.started = true;
            };
            this.mousemove = e => {
                if ( this.started ) {
                    ctx.lineTo ( e._x, e._y );
                    ctx.stroke ();
                    socket.send ( JSON.stringify ( {
                        type: 'DRAW',
                        canvas: canvas.itemId,
                        data: canvas.toDataURL ()
                    } ) )
                }
            };
            this.mousemove = e => {
                if ( this.started ) {
                    ctx.lineTo ( e._x, e._y );
                    ctx.stroke ();
                    socket.send ( JSON.stringify ( {
                        type: 'DRAW',
                        canvas: canvas.itemId,
                        data: canvas.toDataURL ()
                    } ) )
                }
            };
            this.mouseup = e => {
                if ( this.started ) {
                    this.mousemove ( e );
                    this.started = false;
                }
            };
            this.mouseleave = e => {
                this.started = false
            };

            this.touchstart = this.mousedown;
            this.touchmove = this.mousemove;
            this.touchend = this.mouseleave
        }

        function canvasEvents ( e ) {
            if ( e.layerX || e.layerX == 0 ) { // Firefox
                e._x = e.layerX;
                e._y = e.layerY;
            } else if ( e.offsetX || e.offsetX == 0 ) { // Opera
                e._x = e.offsetX;
                e._y = e.offsetY;
            }
            const func = pencil[ e.type ];
            if ( func ) {
                func ( e );
            }
        }
    }
}