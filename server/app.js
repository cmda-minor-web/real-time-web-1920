require("dotenv").config();
const nunjucks = require("nunjucks");
const router = require("./routes/router.js");
const path = require("path");
const port = process.env.PORT || 4000;
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const Api = require("./modules/api.js");
const Data = require("./modules/data.js")

nunjucks.configure(`${__dirname}/view/pages`, {
    autoescape: true,
    express: app
  });

Api.getNewCardDeck()
    .then(getNewCardDeck => gameMaker(getNewCardDeck));

const users = [];
const players = [];
let currentTurn = 0;
let turn = 0;
let connectCounter = 0;

function countInArray(array, what) {
  return array.filter(item => item == what).length;
}

async function dealCards(id){

  const drawnCards = await Api.drawCards(id, 4);

  const transformedCards = Data.transformCardValues(drawnCards)


  // console.log('drawnCAAAARDSS: ', transformedCards)

  // // findPlayer(players, socket.id).cardsInHand.push(drawnCards)

  // // every client draws 4 cards at start of the game
  return transformedCards

}

async function shuffleCards(id){
  const shuffledCards = await Api.shuffleCards(id)

  return shuffledCards
}

function allCardsPlayed(arrLength){
  return arrLength === 4;
}

function firstCardPlayed(arrLength){
  return arrLength === 1;
}

function secondCardPlayed(arrLength){
  return arrLength === 2;
}

function thirdCardPlayed(arrLength){
  return arrLength === 3;
}

function next_turn(socket, cards){

  turn = ++currentTurn % players.length
  // client.emit('your turn', "it's your turn sonny")
  // io.to(socketId).emit('your turn', "it's your turn sonny")

  // emit only to next player
  
  console.log("====================next turn triggered: ==========================",turn)

  socket.to(players[turn].id).emit('your turn', `it's your turn ${players[turn].name}`, cards)

  // emit a message to all other 
}

function findHighestCard(arr){
  return arr.map(player => player.playedCards.map(cards => {
    return {
      suit: cards.suit, 
      value: cards.value
    }
  
  }))
}

function findPlayer(array, socketId){
  return array.find(player => player.id == socketId);
}


app
  .use(express.static(path.join(__dirname, "static")))
  .get("/", router.homeRoute);

function gameMaker(deck) {
  io.on("connection", async (socket) => {
    //step1: first make a room
    // console.log('soccket: ', socket)
    socket.on("send-nickname", nickname => {
      // Taking turns
      players.push({ id: socket.id, name: nickname, playedCards: [], points: 0});

      console.log('playaHatazz: ', players)
      // console.log(users)

      socket.on('room', (room) => {
        socket.join(room)


        // if 4 clients in the room make a new room
        const clients = io.sockets.adapter.rooms["game"].length;

        if(players.length >= 2){
          // bron: https://stackoverflow.com/questions/44661841/why-is-my-socket-io-event-firing-multiple-times
          // socket.emit('your turn', "it's your turn")
          socket.to(players[turn].id).emit('your turn', `it's your turn ${players[turn].name}`)
  
          }
      })
    })

        const drawnCards = await dealCards(deck.deck_id)

        // // every client draws 4 cards at start of the game
        io.to(socket.id).emit("deal cards", drawnCards);



        socket.on("clicked card", async (playedCard, cards) => {
          //logs the card that has been played
          //in order to erase the card from the deck this card has to be found in the card deck

          console.log('playedCard: ', playedCard)

          const player = findPlayer(players, socket.id)

          player.playedCards.push(playedCard)


          let values = findHighestCard(players)

          values.map(value => console.log('VALUE LENGTHHH', value.length))
          values.every(value => console.log('THE TRUTH: ', firstCardPlayed(value.length)))

          if(values.every(value => firstCardPlayed(value.length)) === false && players[turn].id === socket.id){
            console.log('DEZE FUNCTIE WORD NU UITGEVOERD')

            next_turn(socket, cards)
          }

          else if(values.every(value => firstCardPlayed(value.length)) === false && players[turn].id !== socket.id){
            console.log('DEZE FUNCTIE WORD NU UITGEVOERD')

            next_turn(socket, cards)
          }
          
          // if(values.every(value => secondCardPlayed(value.length)) === false && players[turn].id === socket.id){
          //   // console.log('oeeelaaaala: ', players[turn].id)
          //   // players[turn].myTurn = true
          //   // socket.emit('make cards clickable')
          //   next_turn(socket, cards)
          // }


          
          

          function findRoundWinner(firstCardValue, findCardFunction){          
  
          console.log('oejejjeje', firstCardValue)

          let firstCard = firstCardValue //firstCardValue
          let otherPlayerCards = values.slice(!0).flat()
          let matchingSuits = otherPlayerCards.filter(card => card.suit === firstCard.suit)
          let winner

          if(players.every(player => findCardFunction(player.playedCards.length)) === true && matchingSuits.length === 0){ //findCardFunction
            console.log(":::::::::   FIRST ROUND FINISHED    ::::::::::::::")

              winner = players.find(player => player.playedCards[0].suit === firstCard.suit)

          }
            
          if(players.every(player => findCardFunction(player.playedCards.length)) === true && matchingSuits.length > 0){ //findCardFunction

              matchingSuits.push(firstCard)

              console.log('HEt complete plaatje: ', matchingSuits)

              // find de speler met de hogste kaart nu

              const winningValue = Math.max.apply(Math, matchingSuits.map(card => card.value))

              // now search winning card in matchingSuits

              const winningCard = matchingSuits.find(card => card.value === winningValue)

              console.log('The winningCarrdddd: ', winningCard)
              
              winner = players.find(player => player.playedCards.some(card => card.value === winningCard.value && card.suit === winningCard.suit))

              // console.log('THE ROUND WINNER =====', winner.name)

              // socket.to(winner.id).emit('your turn', `You won this round!!`)
              
            // }

          }
          return winner
        }

        let firstRoundWinner
        let secondRoundWinner
        let thirdRoundWinner



        // console.log('VAAALUES: ', values[0][0].length, players.length)

        //if values.length === players.length
        console.log('VAAALUES: ', values)
        console.log('VAAALUES: ', values[1].length)

        if(values.every(value => firstCardPlayed(value.length)) === true) {
          console.log('valuessssss')
          // console.log(value)
          firstRoundWinner = findRoundWinner(values[0][0], firstCardPlayed)
          console.log("Round 1 WINNERRR", firstRoundWinner)
          io.to(firstRoundWinner.id).emit('your turn', `You won this round!!`)
        }

        

        if(values.every(value => secondCardPlayed(value.length)) === true) {
          console.log('valuessssss 2222')
          // check which array has a item first

          values.find(d => console.log('aaa: ', d))
          secondRoundWinner = findRoundWinner(values[1][0], secondCardPlayed)
          console.log("Round 2 WINNERRR", secondRoundWinner)
          socket.to(secondRoundWinner.id).emit('your turn', `You won this round!!`)
        }
        
          
          // check if everyone played 4 cards
          if(players.every(player => allCardsPlayed(player.playedCards.length)) === true){
            // this is what happens when everyone played his last card
            //Math.max?


            const values = findHighestCard(players)

            console.log('fereereerre', values)

            const maxRow = values.map( (row) => row.pop());

            //this finds the highest lat played card
            const winningValue = Math.max.apply(null, maxRow)

            //Find the player that played the winning value card

            //step 1 players.find(player => player.playedCards.pop() === same as highest vlaue)
            const winner = players.find(player => player.playedCards[3].value === winningValue)
            const losers = players.filter(player => {
              if(player !== winner) player.points++
            })
            
            
            console.log(":::::::::::::::::::::WINNER::::::::::::::::::::", winner)
            console.log(":::::::::::::::::::::NOT-WINNER::::::::::::::::::::: ", losers)


            // io.in("game").emit("winner", winner.name)

            players.forEach(player => player.playedCards = [])

            io.in("game").emit("round over", 'get ready for the next round')

          }




          // const playedCardStack = await Api.cardPiles(
          //   deck.deck_id,
          //   "playedCards",
          //   playedCard.code
          // );
          const discards = await Api.cardPiles(
            deck.deck_id,
            "discards",
            playedCard.code
          );


          const toBeRemovedFromHand = cards.cards.findIndex(
            card => card.code == playedCard.code
          );


          cards.cards.splice(toBeRemovedFromHand, 1);

          io.in("game").emit("show played card", playedCard);
          // io.to(socket.id).emit('drawn card', drawnCard.cards[0], cards);
        });


        socket.on("next round", async() => {

          const shuffledCards = await shuffleCards(deck.deck_id)

          // console.log(':::::::::NEWCARDS:::::::::::::: ', shuffledCards)

          const newCards = await Api.drawNewCards(shuffledCards.deck_id)

          // console.log('newwwwwcardsssszz: ', newCards)

          const transformedNewCards = Data.transformCardValues(newCards)

          // setTimeout(() => {
            io.to(socket.id).emit("deal cards", transformedNewCards)
          // }, 5000)

          if(players[turn].id === socket.id){
            // bron: https://stackoverflow.com/questions/44661841/why-is-my-socket-io-event-firing-multiple-times
            socket.emit('your turn', "it's your turn FUCKER")
    
            }

        })

    socket.on('disconnect', function(reason){
      console.log('A player disconnected, ', reason);
      players.splice(players.indexOf(socket),1);
      turn--;
      console.log("A number of players now ",players.length);
    });

  });
}

server.listen(port, () => {
  console.log(`Dev app listening on port: ${port}`);
});
