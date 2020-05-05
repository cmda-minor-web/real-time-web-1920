function hasDuplicates(arr) {
    return new Set(arr).size !== arr.length;
}

function transformCardValues(cards){
    
cards.cards.map(card => {
    // console.log('vaaaluee: ', card.value.length)

    if(card.value.length === 1 || card.value === '10') card.value = +card.value

    if(card.value === 'JACK') card.value = 3
    if(card.value === 'QUEEN') card.value = 4
    if(card.value === 'KING') card.value = 5
    if(card.value === 'ACE') card.value = 6
  
  })

  return cards
}

module.exports = {hasDuplicates, transformCardValues}