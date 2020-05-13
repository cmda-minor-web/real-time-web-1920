# Toepen

## Introduction
Mijn vrienden en ik toepen graag met elkaar toen ik de deck of cards api zag wist ik dan ook eindelijk wat mijn concept zou moeten zijn, een potje tjoep natuurlijk! Omdat het tijdens deze moeilijke tijden van corona niet altijd mogelijk is bij elkaar over de vloer te gaan dacht ik dat het leuk en bruikbaar zou zijn om zelf een online toep spel te maken.

## Contents

* ### [Game rules]()
* ### [Data lifecycle]()
* ### [Real Time events]()
* ### [API Used]()
* ### [Features]()
* ### [Installation]()

## Game rules

Toepen is played with the follwing cards: Ace, King, Queen and Jack and cards 10, 9, 8 and 7. The other cards are removed from the game.

Each player gets 4 cards. One player can play a card on the field. The other players have to match the suit of the first played card. If they don't have a card of that suit they are allowed to play another suit. The highest card of the suit wins the round, and can start the next round. If no one else matches suits with the first played card the first player wins the round.

Whenever you lose you get a point, the player that wins doesn't get points. When you reach 14 points you lose. 

If you decide to toep the other players have to say whether they leave or stay. The players that stay now play for an extra point. Each player can toep once.

If you get 4 cards that aren't numbers you can call 'vuile was'. If no one decides to check if you really don't have any numbered cards, you get to draw 4 new cards and the player that checked you gets a point. If your 'vuile was' was false you get a point and you don't get to draw new cards.



## Data lifecycle

![DLS](https://user-images.githubusercontent.com/47485018/81064952-e5583780-8eda-11ea-834e-0229f440116d.png)

## Realtime events

### Setup events

#### Send nickname event

This event sends out the nickname a user fills in before starting the game.

```js
socket.emit('send-nickname', nickname.value)
```

#### The room event

Before starting the game players need to choose a room they want to play in

```js
socket.emit('room', button.value)
```

#### Send start signal

Whem theres a minimum of two players in a room, the start signal gets emitted from the server to the clients. 
This makes the start game button clickable for all players in the room.

```js
socket.on('send start signal', (mdg, cards) => {

    startButton.disabled = false

    startButton.addEventListener('click', startGame)
})
```

### Game events

#### Your turn event

Whenever a player has played it's turn a function on the server is fired ot determine who's turn it is next. After determining who's turn it is the your turn event gets emitted to the socket next in line

```js
socket.on('your turn', (msg) => {
    noti = msg

    turn.textContent = noti

    const cardsInHand = document.querySelectorAll('.card')

    const onClick = function() {
        findCard(this, myCards)
        // console.log(this)
        cardsInHand.forEach(card => {
          card.removeEventListener('click', onClick);
        });
      };
      
      cardsInHand.forEach(card => {
        card.addEventListener('click', onClick);
      });

})
```

#### Clicked card event

The clicked card emits to the server which card was clicked, on the server the socket ewho played the card gets added to the played cards object of the rigt players
```js
socket.emit('clicked card', foundCard, cards)
```

Toep event
```js
toepButton.addEventListener('click', () => socket.emit('toep', 'er word getoept'))
```

Toep popup event
```js
socket.on('toep popup', (msg) => {
    popup.style.display = "block";
    toepMessage.textContent = msg
})
```

Deal cards event
```js
socket.on('deal cards', (cards, turn) => {

    myCards = cards

    cards.cards.forEach(card => {
        
        appendCard(cardsSection, card.image, 'card')
        
    });
})
```

Show played card event
```js
socket.on('show played card', (card, cards) => {

    appendCard(gameField, card.image, 'playedCard')

})
```

Winner event
```js
socket.on('winner', (winner) => {

    console.log('the winner is: ', winner)

})
```

Round over event
```js
socket.on('round over', (msg) => {
    // gameField.innerHTML = ''

    gameField.innerHTML = ''

    socket.emit('next round')
    
})
```

Round winner event
```js
socket.on('round winner', (msg) => {
    console.log(msg)
})
```


## API used

In order to get a card deck the app makes use of the[Deck of cards api](https://deckofcardsapi.com/). You don't need a API key to use the API, and i don't think theres a request limit. The types of requests that are used:

Endpoint fetches: 

1: Get a new card deck and shuffle the cards, we don't need sixes, fives, fours, threes and two's
```js
async function getNewCardDeck() {
    const getCards = await fetch(
      "https://deckofcardsapi.com/api/deck/new/shuffle/?cards=JS,QS,KS,AS,7S,8S,9S,0S,JD,QD,KD,AD,7D,8D,9D,0D,JC,QC,KC,AC,7C,8C,9C,0C,JH,QH,KH,AH,7H,8H,9H,0H"
    );
  
    const cards = await getCards.json();
  
    return cards;
  }
```

2: Draw 4 cards out of the card deck
```js
async function drawCards(id, count) {
    const getCards = await fetch(
      `https://deckofcardsapi.com/api/deck/${id}/draw/?count=${count}`
    );
  
    const cards = await getCards.json();
  
    return cards;
  }
```

3: Shuffle the cards when everyone is done with the round
```js
async function shuffleCards(id) {
  const shuffle = await fetch(
    `https://deckofcardsapi.com/api/deck/${id}/shuffle/`
  );

  const shuffledDeck = await shuffle.json()

  return shuffledDeck
}
```
# Features



## Uiteindelijke keuze: Toepen

Mijn vrienden en ik toepen graag met elkaar toen ik de deck of cards api zag wist ik dan ook eindelijk wat mijn concept zou moeten zijn, een potje tjoep natuurlijk!

