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

## Data lifecycle

![DLS](https://user-images.githubusercontent.com/47485018/79842418-16077f80-83b9-11ea-9582-706b16b09a27.png)


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


## Uiteindelijke keuze: Toepen

Mijn vrienden en ik toepen graag met elkaar toen ik de deck of cards api zag wist ik dan ook eindelijk wat mijn concept zou moeten zijn, een potje tjoep natuurlijk!

