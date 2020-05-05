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
  
  console.log("next turn triggered: ",turn)

  socket.to(players[turn].id).emit('your turn', `it's your turn ${players[turn].name}`, cards)

  
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

        if(players[turn].id === socket.id){
          // bron: https://stackoverflow.com/questions/44661841/why-is-my-socket-io-event-firing-multiple-times
          socket.emit('your turn', "it's your turn")
  
          }
      })
    })

      // socket.join("game", async () => {
        
        // console.log(nickname, " joined ze game");

        // if more than 4 players make new room
        // const clients = io.sockets.adapter.rooms["game"].length;
        


        //  console.log(clients)

        // io.in('game').emit('big-announcement', 'the game will start soon');


        const drawnCards = await dealCards(deck.deck_id)

        // // every client draws 4 cards at start of the game
        io.to(socket.id).emit("deal cards", drawnCards);

        // socket.on('pass turn', (msg) => console.log(msg))

        socket.on("clicked card", async (playedCard, cards) => {
          //logs the card that has been played
          //in order to erase the card from the deck this card has to be found in the card deck


          console.log('playedCard: ', playedCard)

          const player = findPlayer(players, socket.id)

          player.playedCards.push(playedCard)
          // pass turn to next player
          // next_turn(socket, socket.id)

          if(players[turn].id === socket.id){
            // console.log('oeeelaaaala: ', players[turn].id)
            // players[turn].myTurn = true
            // socket.emit('make cards clickable')
            next_turn(socket, cards)
          }


      
          console.log('Poooooooolooooo: ', players)

          

          // push every playedCard in the playedCards array

          if(players.every(player => firstCardPlayed(player.playedCards.length)) === true){
            console.log(":::::::::   FIRST ROUND FINISHED    ::::::::::::::")
            const values = findHighestCard(players)

            const firstCardPlayed = values.flat()[0]

            const otherPlayerCards = values.slice(!0).flat()

            const matchingSuits = otherPlayerCards.filter(card => card.suit === firstCardPlayed.suit)


            if(matchingSuits.length === 0) {

              const winner = players.find(player => player.playedCards[0].suit === firstCardPlayed.suit)

              console.log(winner.name, ' won this round')

              socket.to(winner.id).emit('your turn', `You won this round!!`)

            } else if(matchingSuits.length > 0){

              matchingSuits.push(firstCardPlayed)

              console.log('HEt complete plaatje: ', matchingSuits)

              // find de speler met de hogste kaart nu

              const winningValue = Math.max.apply(Math, matchingSuits.map(card => card.value))

              // now search winning card in matchingSuits

              const winningCard = matchingSuits.find(card => card.value === winningValue)

              console.log('The winningCarrdddd: ', winningCard)
              
              const winner = players.find(player => player.playedCards.some(card => card.value === winningCard.value && card.suit === winningCard.suit))

              // console.log('THE ROUND WINNER =====', winner.name)

              socket.to(winner.id).emit('your turn', `You won this round!!`)
              
            }

          }

          if(players.every(player => secondCardPlayed(player.playedCards.length)) === true){
            console.log(":::::::::   SECOND ROUND FINISHED    ::::::::::::::")

            const values = findHighestCard(players)

            const firstCardPlayed = values.flat()[1]

            console.log(firstCardPlayed)
          }

          // if(players.every(player => thirdCardPlayed(player.playedCards.length)) === true){
          //   console.log(":::::::::   THIRD ROUND FINISHED    ::::::::::::::")
          // }
          
          
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
            

            // setTimeout(function(){ io.to(socket.id).emit("deal cards", drawNewCards);}, 5000);


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

          io.in("game").emit("clicked card", playedCard);
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

        // io.in('game').emit('show played card', 'the game will start soon');
        // socket.on('play card', )
      // });
    // });
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
