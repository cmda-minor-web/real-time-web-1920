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
let canJoin = true

nunjucks.configure(`${__dirname}/view/pages`, {
    autoescape: true,
    express: app
  });

// Api.getNewCardDeck()
//     .then(getNewCardDeck => gameMaker(getNewCardDeck));

let games = Array(4);
let currentRoom;
let currentTurn = 0;
let turn = 0;
let connectCounter = 0;
let cardDeck
let arrayfiedClientList

async function fillGamesArray(){
for (let i = 0; i < 4; i++) {
  games[i] = {players: 0 , pid: [0 , 0, 0, 0], deck: {}, turn: 0, currentTurn: 0, toeps: 0, playerList: [
    {
      id: '',
      name: '',
      playedCards: [],
      points: 0,
      roundWinner: false
    },
    {
      id: '',
      name: '',
      playedCards: [],
      points: 0,
      roundWinner: false
    },
    {
      id: '',
      name: '',
      playedCards: [],
      points: 0,
      roundWinner: false
    },
    {
      id: '',
      name: '',
      playedCards: [],
      points: 0,
      roundWinner: false
    },
  ]};
  games[i].deck = await Api.getNewCardDeck()
}
}

fillGamesArray()

function countInArray(array, what) {
  return array.filter(item => item == what).length;
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

function next_turn(obj, socket){

  
  const players = obj.pid.filter(id => id !== 0)

  obj.turn = ++obj.currentTurn % players.length

  console.log('its, this players turn now : ', players[obj.turn])

  socket.to(players[obj.turn]).emit('your turn', `it's your turn ${players[obj.turn]}`)

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

function findLastRoundWinner(array, bool){
  return array.find(player => player.roundWinner == bool);
}

function findRoom(array, socketId, room){
  return array.find(player => player.id == socketId && player.room === room);
}


app
  .use(express.static(path.join(__dirname, "static")))
  .get("/", router.homeRoute);

// function gameMaker(deck) {
  io.on("connection", async (socket) => {
    //step1: first make a room
    // console.log('soccket: ', socket)
    const playerId = socket.id

    console.log(playerId + ' connected');

    socket.on("send-nickname", nickname => {
      // Taking turns
      // players.push({ id: socket.id, name: nickname, playedCards: [], points: 0, roundWinner: false});
      // console.log(users)

      socket.on('room', async(room) => {
        
        console.log('room: ', room)

        socket.join(room)

        
        if (games[room].players < 4) {
          games[room].players++;
          games[room].pid[games[room].players - 1] = playerId;
          games[room].playerList[games[room].players - 1].id = playerId
          games[room].playerList[games[room].players - 1].name = nickname
      } // else emit the full event
      else{
        socket.emit('full', 'This room is full', room)
        return;
    }
     console.log(games[room]);
    players = games[room].players

    socket.emit('player', { playerId, players, room })

      })
    })
    
    socket.on('play', (room) => {
      socket.broadcast.emit('play', room);
      console.log("ready " + room);
      let players = games[room].pid.filter(id => id !== 0)

      async function deal(){

      for(const [index, playerId] of players.entries()){
        // const drawnCards = await Api.drawCards(games[room].deck.deck_id, 4)
        console.log('for of loop: ', index, playerId)
        
        const drawnCards = await Api.drawCards(games[room].deck.deck_id, 4)

        const transformedCards = Data.transformCardValues(drawnCards)
        
        io.to(playerId).emit("deal cards", transformedCards);

      }
      // next_turn(games[room], socket)
      socket.to(players[0]).emit('your turn', 'first turn is for you')
    }
      deal()


    })

        

        // // every client draws 4 cards at start of the game
        // io.to(socket.id).emit("deal cards", drawnCards);

        // socket.on('start game', async(msg) => {
        //   // console.log(msg)

        //   // cardDeck = await Api.getNewCardDeck()

        //   // console.log('start game function: ', cardDeck)

        //   // const drawnCards = await dealCards(cardDeck.deck_id)
        //   const drawnCards = await dealCards(cardDeck.deck_id)
        //   console.log(drawnCards)

        //   io.to(socket.id).emit("deal cards", drawnCards);

        //   console.log('aaaFIEFKSWLEFKWSEFKWEF', arrayfiedClientList)

        //   const firstPlayer = findPlayer(players, arrayfiedClientList[0])
          
        //   console.log('finsKAKAKA', firstPlayer)

        //   const currentPlayer = findPlayer(players, socket.id)
        //   console.log('currennnetPlaayer: ', currentPlayer)

        //   next_turn(socket)
        //   // socket.to(currentPlayer.room).emit('your turn', `You can do the first turn`)
        // })
        
        
        
        // io.to(socket.id).emit("deal cards", drawnCards);

        socket.on("clicked card", async (playedCard, cards, room) => {
          //logs the card that has been played
          //in order to erase the card from the deck this card has to be found in the card deck

          // i need the room number
          // socket id
          let players = games[room].playerList.filter(player => player.id !== '')

          console.log('filltaareddee PLaaysserlisiisisit::::', players)

          console.log('playedCard: ', playedCard)
          console.log('room: ', room)
          

          const player = findPlayer(players, socket.id)

          

          player.playedCards.push(playedCard)

          io.in(room).emit("show played card", playedCard);

          console.log('PLAYAA: ', player)


          let values = findHighestCard(players)

          console.log(values)

          values.map(value => console.log('VALUE LENGTHHH', value.length))
          values.every(value => console.log('THE TRUTH: ', firstCardPlayed(value.length)))
          // console.log('turn === socket id: ', players[turn].id === socket.id)


          
          if(values.every(value => firstCardPlayed(value.length)) === false && values.every(value => secondCardPlayed(value.length)) === false){
            console.log('SOCKET ID COMP FALSE NUMER 1111111111')

            next_turn(games[room], socket)
          }

          // else if(values.every(value => firstCardPlayed(value.length)) === false && players[turn].id !== socket.id){
          //   console.log('SOCKET ID COMP FALSE')

          //   next_turn2(socket, cards)
          // }
          
          // if(values.every(value => secondCardPlayed(value.length)) === false && players[turn].id === socket.id){
          //   // console.log('oeeelaaaala: ', players[turn].id)
          //   // players[turn].myTurn = true
          //   // socket.emit('make cards clickable')
          //   next_turn(socket, cards)
          // }

          // next_turn(socket)
          
          

          function findRoundWinner(firstCardValue, findCardFunction, cardsArray, arrNumber){          
  
          console.log('oejejjeje', firstCardValue)

          console.log(cardsArray)

          let firstCard = firstCardValue //firstCardValue
          let otherPlayerCards = cardsArray.slice(!0).flat()
          let matchingSuits = otherPlayerCards.filter(card => card.suit === firstCard.suit)
          let winner
          let losers

          if(players.every(player => findCardFunction(player.playedCards.length)) === true && matchingSuits.length === 0){ //findCardFunction
            console.log("::::::::: ROUND FINISHED ::::::::::::::")

              winner = players.find(player => player.playedCards[arrNumber].suit === firstCard.suit)

              console.log(winner)

              winner.roundWinner = true

              losers = players.filter(player => player !== winner)

              console.log('LOSEERS: ', losers)

              losers.map(loser => loser.roundWinner = false)

              
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

              losers = players.filter(player => player !== winner)

              console.log('LOSEERS: ', losers)

              losers.map(loser => loser.roundWinner = false)

              winner.roundWinner = true

          }
          return winner
        }

        let firstRoundWinner
        let secondRoundWinner
        let thirdRoundWinner
        let fourthRoundWinner



        // console.log('VAAALUES: ', values[0][0].length, players.length)

        //if values.length === players.length
        console.log('VAAALUES: ', values)
        console.log('VAAALUES: ', values[1].length)
        console.log(values.every(value => firstCardPlayed(value.length)))

        if(values.every(value => firstCardPlayed(value.length)) === true) {
          console.log('valuessssss')
          // console.log(value)

          const firstPlayedCards = values.map(card => card[0])

          console.log(values[0][0])

          firstRoundWinner = findRoundWinner(values[0][0], firstCardPlayed, firstPlayedCards, 0)
          console.log("Round 1 WINNERRR", firstRoundWinner)
          io.to(firstRoundWinner.id).emit('your turn', `You won this round!!`)
        }
        
        if(players.length === 2 && players.every(player => firstCardPlayed(player.playedCards.length)) === false && players.every(player => secondCardPlayed(player.playedCards.length)) === false && players.every(player => thirdCardPlayed(player.playedCards.length)) === false ){

          //&& games[room].pid[games[room].turn] === players[games[room].turn].id
          console.log('SOCKET ID COMP false NRRR 222222')
          console.log(games[room].pid[games[room].turn])
          console.log(players[games[room].turn].id)
          next_turn(games[room], socket)
        }
        if(players.length > 2 && players.every(player => firstCardPlayed(player.playedCards.length)) === false && players.every(player => secondCardPlayed(player.playedCards.length)) === false && players.every(player => thirdCardPlayed(player.playedCards.length)) === false && games[room].pid[games[room].turn] === socket.id){
          console.log('SOCKET ID COMP false NRRR 222222')

          next_turn(games[room], socket)
        }
        
        console.log('2 cards have been played by every player', values.every(value => secondCardPlayed(value.length)) === true)

        
        if(values.every(value => secondCardPlayed(value.length)) === true) {

          const secondPlayedCards = values.map(card => card[1])

          const lastRoundWinner = findLastRoundWinner(players, true)

          const latsPlayedCardRoundWinner = lastRoundWinner.playedCards[1]

          const cardToCheck = secondPlayedCards.find(card => card.suit === latsPlayedCardRoundWinner.suit && card.value === latsPlayedCardRoundWinner.value)

          console.log('THE CARD THAT SHOULD BE CHECKED FIRST ::::', cardToCheck)
          console.log('THE CARD THAT SHOULD BE CHECKED FIRST ::::', lastRoundWinner)

          // second played cards needs to be passed to the function
          secondRoundWinner = findRoundWinner(cardToCheck, secondCardPlayed, secondPlayedCards, 1)
          console.log("Round 2 WINNERRR", secondRoundWinner)

          //when the last round winner wins cards get played double...

          io.to(secondRoundWinner.id).emit('your turn', `You won second round!!`)
        }
        
          

        if(values.every(value => thirdCardPlayed(value.length)) === true) {
          // console.log('valuessssss 2222')
          // check which array has a item first

          console.log('==================THIRD ROUND WAS FINSHED====================')

          const thirdPlayedCards = values.map(card => card[2])

          console.log(thirdPlayedCards)

          const lastRoundWinner = findLastRoundWinner(players, true)

          const latsPlayedCardRoundWinner = lastRoundWinner.playedCards[2]

          const cardToCheck = thirdPlayedCards.find(card => card.suit === latsPlayedCardRoundWinner.suit && card.value === latsPlayedCardRoundWinner.value)

          console.log('THE CARD THAT SHOULD BE CHECKED FIRST ::::', cardToCheck)


          thirdRoundWinner = findRoundWinner(cardToCheck, thirdCardPlayed, thirdPlayedCards, 2)
          console.log("Round 3 WINNERRR", thirdRoundWinner)
          io.to(thirdRoundWinner.id).emit('your turn', `You won third round!!`)
        }

        


        
        console.log('ALL PLAYERS LAYED 4 CARDS DWON : ', players.every(player => allCardsPlayed(player.playedCards.length)))
        players.map(player =>  console.log('true card legth: ', player.playedCards.length))  
        //   // check if everyone played 4 cards
          if(players.every(player => allCardsPlayed(player.playedCards.length)) === true){
            // this is what happens when everyone played his last card
            //Math.max?

            console.log('==================FOURTH ROUND WAS FINSHED====================')

            const fourthPlayedCards = values.map(card => card[3])

            console.log('4th card: ', fourthPlayedCards)

            const lastRoundWinner = findLastRoundWinner(players, true)

            const latsPlayedCardRoundWinner = lastRoundWinner.playedCards[3]

            const cardToCheck = fourthPlayedCards.find(card => card.suit === latsPlayedCardRoundWinner.suit && card.value === latsPlayedCardRoundWinner.value)

            console.log('THE CARD THAT SHOULD BE CHECKED FIRST ::::', cardToCheck)


            fourthRoundWinner = findRoundWinner(cardToCheck, allCardsPlayed, fourthPlayedCards, 3)
            console.log("Round 4 WINNERRR", fourthRoundWinner)

            const losers = players.filter(players => players.id !== fourthRoundWinner.id)

            losers.map(loser => {
              loser.points ++
            })

            console.log(players)
            // io.to(thirdRoundWinner.id).emit('your turn', `You won third round!!`)

            // //this finds the highest lat played card
            // const winningValue = Math.max.apply(null, maxRow)

            // //Find the player that played the winning value card

            // //step 1 players.find(player => player.playedCards.pop() === same as highest vlaue)
            // const winner = players.find(player => player.playedCards[3].value === winningValue)
            // const losers = players.filter(player => {
            //   if(player !== winner) player.points++
            // })


            
            
            // console.log(":::::::::::::::::::::WINNER::::::::::::::::::::", winner)
            // console.log(":::::::::::::::::::::NOT-WINNER::::::::::::::::::::: ", losers)


            // io.in("game").emit("winner", winner.name)

            

            

            io.in(room).emit("game over", `${fourthRoundWinner.name}, won this game. Get ready for the next one!`)

            players.forEach(player => player.playedCards = [])

          }

        });


        socket.on("next round", async(room) => {

          const shuffledCards = await shuffleCards(games[room].deck.deck_id)

          // console.log(':::::::::NEWCARDS:::::::::::::: ', shuffledCards)

          const newCards = await Api.drawCards(shuffledCards.deck_id, 4)

          
          // console.log('newwwwwcardsssszz: ', newCards)

          const transformedNewCards = Data.transformCardValues(newCards)
          

          // setTimeout(() => {
            io.to(socket.id).emit("deal cards", transformedNewCards)

            socket.to(games[room].pid[0]).emit('your turn', 'first turn is for you')


          // }, 5000)

          // if(players[turn].id === socket.id){
          //   // bron: https://stackoverflow.com/questions/44661841/why-is-my-socket-io-event-firing-multiple-times
          //   socket.emit('your turn', "it's your turn FUCKER")
    
          //   }

        })

    // when the user disconnects from the server, remove him from the game room
  socket.on('disconnect', () => {
  for (let i = 0; i < 4; i++) {
      if (games[i].pid[0] == playerId || games[i].pid[1] == playerId)
          games[i].players--;
  }
  console.log(playerId + ' disconnected');
 
 });

  });
// }

server.listen(port, () => {
  console.log(`Dev app listening on port: ${port}`);
});