const fetch = require("node-fetch");

async function getNewCardDeck() {
    const getCards = await fetch(
      "https://deckofcardsapi.com/api/deck/new/shuffle/"
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

  module.exports = {getNewCardDeck, drawCards, cardPiles, pileList}