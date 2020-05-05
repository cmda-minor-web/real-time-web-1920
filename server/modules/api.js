const fetch = require("node-fetch");

async function getNewCardDeck() {
    const getCards = await fetch(
      "https://deckofcardsapi.com/api/deck/new/shuffle/?cards=JS,QS,KS,AS,7S,8S,9S,0S,JD,QD,KD,AD,7D,8D,9D,0D,JC,QC,KC,AC,7C,8C,9C,0C,JH,QH,KH,AH,7H,8H,9H,0H"
    );
  
    const cards = await getCards.json();
  
    return cards;
  }
  
async function drawCards(id, count) {
    const getCards = await fetch(
      `https://deckofcardsapi.com/api/deck/${id}/draw/?count=${count}`
    );
  
    const cards = await getCards.json();
  
    return cards;
  }
  
async function cardPiles(id, pileName, cardsToAdd) {
    const pile = await fetch(
      `https://deckofcardsapi.com/api/deck/${id}/pile/${pileName}/add/?cards=${cardsToAdd}`
    );
  
    const piles = await pile.json();
  
    return piles;
  }
  
async function pileList(id, pileName) {
    const pile = await fetch(
      `https://deckofcardsapi.com/api/deck/${id}/pile/${pileName}/list/`
    );
  
    const piles = await pile.json();
  
    return piles;
  }

async function shuffleCards(id) {
  const shuffle = await fetch(
    `https://deckofcardsapi.com/api/deck/${id}/shuffle/`
  );

  const shuffledDeck = await shuffle.json()

  return shuffledDeck
}

async function drawNewCards(id) {

  console.log('IIIIEEEEDD', id)

  const getCards = await fetch(
    `https://deckofcardsapi.com/api/deck/${id}/draw/?count=4`
  )


  const cards = await getCards.json();

  console.log('::::::::::::::GETCAAARDDDRSSSSSSS::::::::::::::', cards)


  return cards
}

  module.exports = {getNewCardDeck, drawCards, cardPiles, pileList, shuffleCards, drawNewCards}