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
const roomId = ''

nunjucks.configure(`${__dirname}/view/pages`, {
    autoescape: true,
    express: app
  });

// Api.getNewCardDeck()
//     .then(getNewCardDeck => gameMaker(getNewCardDeck));

let turnArray = [
  {
    'turn': 0,
    'currentTurn': 0,
    'room': 'Gameroom 1'
  },
  {
    'turn': 0,
    'currentTurn': 0,
    'room': 'Gameroom 2'
  },
  {
    'turn': 0,
    'currentTurn': 0,
    'room': 'Gameroom 3'
  },
  {
    'turn': 0,
    'currentTurn': 0,
    'room': 'Gameroom 4'
  }
]


const players = [];
let roomsArray;
let currentRoom;
let currentTurn = 0;
let turn = 0;
let cardDeck
let arrayfiedClientList
let playerRoomSorted

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

function next_turn(arr , socket, gameRoom){

  console.log('FUNC', arr)
  console.log('gameRoom to be found: ', gameRoom)

  const roomToPassTurn = turnArray.find(turnObj => turnObj.room === gameRoom)

  console.log(roomToPassTurn)

  const roomList = playerRoomSorted.find(room => room.some(playerRoom => playerRoom))

  console.log('Array to be passed around in: ' , roomList)

  roomToPassTurn.turn = ++currentTurn % roomList.length

  console.log(roomToPassTurn)

  const nextPlayer = findPlayer(roomList, roomList[roomToPassTurn.turn].id)

  console.log(nextPlayer)

  socket.to(nextPlayer.id).emit('your turn', `it's your turn ${nextPlayer.name}`)

  // arr.find

  // playerRoomSorted.forEach(room => {

  //   console.log(room)
  //   turn = ++currentTurn % room.length
  //   const nextPlayer = findPlayer(room, room[turn].id)

  //   console.log('next turn is for: ', nextPlayer)
  //   // emit only to next player
    
  //   console.log("====================next turn triggered: ==========================",turn)

  //   socket.to(nextPlayer.id).emit('your turn', `it's your turn ${nextPlayer.name}`, cards)
  // })

  // turn = ++currentTurn % arrayfiedClientList.length
  // client.emit('your turn', "it's your turn sonny")
  // io.to(socketId).emit('your turn', "it's your turn sonny")

  // const nextPlayer = findPlayer(players, arrayfiedClientList[turn])

  // console.log('next turn is for: ', nextPlayer)
  // emit only to next player
  
  // console.log("====================next turn triggered: ==========================",turn)

  // socket.to(nextPlayer.id).emit('your turn', `it's your turn ${nextPlayer.name}`, cards)
  // socket.to(nextPlayer.room).emit('other player turn', `it's ${nextPlayer.name}'s turn`, cards)

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
    socket.on("send-nickname", nickname => {
      // Taking turns
      players.push({ id: socket.id, name: nickname, playedCards: [], points: 0, roundWinner: false});
      
      // console.log('playaHatazz: ', players)
      // console.log(users)

      socket.on('room', async(room) => {
        
        console.log('room: ', room)

        socket.join(room)

        currentRoom = room

        findPlayer(players, socket.id).room = room
        
        // console.log('players with Room: ', players)

        // if 4 clients in the room make a new room
        const numberOfClientsInRoom = io.sockets.adapter.rooms[currentRoom].length;
        const clientList = io.sockets.adapter.rooms[currentRoom];

        const arrayfied = Object.entries(io.sockets.adapter.rooms)

        const filledRooms = arrayfied.filter(room => room[1].length >= 2)

        // console.log(filledRooms)

        roomsArray = filledRooms.map(room => Object.keys(room[1].sockets))

        console.log('filledROoms: ', filledRooms)
        console.log('filledROoms: ', filledRooms.length)

        playerRoomSorted = roomsArray.map(roomArr => roomArr.map(socketId => findPlayer(players, socketId)))
        
        // playerRoomSorted.map(room => room.push({turn: 0, currentTurn: 0}))


        // console.log('last minute: ', playerRoomSorted.pop())
        // console.log('Room arrays: ', roomsArray)
        // console.log('Mapped room arrays: ', playersInRoom)
        
        // socketsInRoom.map(arr => console.log(arr))
        

        console.log('clients in room: ', numberOfClientsInRoom)
        console.log('clients in room: ', Object.keys(clientList.sockets))
        
        
        arrayfiedClientList = Object.keys(clientList.sockets)
        playerRoomSorted.forEach(async(room) => {
          if(room.length >= 2){
            io.in(currentRoom).emit('send start signal', `game can start ${currentRoom}`);


            cardDeck = await Api.getNewCardDeck()
          }
        })
      })
    })


        

        // // every client draws 4 cards at start of the game
        // io.to(socket.id).emit("deal cards", drawnCards);

        socket.on('start game', async(msg) => {

          

          // cardDeck = await Api.getNewCardDeck()
          
          // console.log('start game function: ', cardDeck)

          // playerRoomSorted.forEach(room => {
          //   // console.log(room[0].room)
          //   turnArray.push({turn: 0, currentTurn: 0, room: room[0].room})
          // })

          // console.log('turnArrayyyy: ', turnArray)

          // const drawnCards = await dealCards(cardDeck.deck_id)
          const drawnCards = await dealCards(cardDeck.deck_id)
          console.log(drawnCards)
          console.log(turnArray)

          io.to(socket.id).emit("deal cards", drawnCards);

          // console.log('aaaFIEFKSWLEFKWSEFKWEF', arrayfiedClientList)

          const firstPlayer = findPlayer(players, arrayfiedClientList[0])
          

          const currentPlayer = findPlayer(players, socket.id)
          // console.log('currennnetPlaayer: ', currentPlayer)
          playerRoomSorted.forEach(room => {
            next_turn(turnArray, socket, currentPlayer.room)
          })
          
          
        })

        socket.on('toep', (msg) => {
          console.log(msg, socket.id)

          const toepingPlayer = findPlayer(players, socket.id)

          socket.to(toepingPlayer.room).emit('toep popup', `${toepingPlayer.name} toept, ga je mee?`);
        
        })
        
        
        
        // io.to(socket.id).emit("deal cards", drawnCards);

        socket.on("clicked card", async (playedCard, cards) => {
          //logs the card that has been played
          //in order to erase the card from the deck this card has to be found in the card deck

          console.log('playedCard: ', playedCard)

          const player = findPlayer(players, socket.id)

          player.playedCards.push(playedCard)


          let values = findHighestCard(players)

          let valuesSortedByRoom = playerRoomSorted.map(room => findHighestCard(room))

          console.log('valuesSortedByRoom', valuesSortedByRoom)

          values.map(value => console.log('VALUE LENGTHHH', value.length))
          
          values.every(value => console.log('THE TRUTH: ', firstCardPlayed(value.length)))
          // console.log('turn === socket id: ', players[turn].id === socket.id)

          // console.log('PLAYERS sorted by room', playerRoomSorted)
          
          valuesSortedByRoom.forEach(room => {
            console.log('EVERY ROOM : ', room)

            // const player = players.find(player => player.playedCards.some(card => card.value === room[0][0].value && card.suit === room[0][0].suit))

            console.log(player)

            if(room.every(value => firstCardPlayed(value.length)) === false && room.every(value => secondCardPlayed(value.length)) === false && room.every(value => thirdCardPlayed(value.length)) === false){
              console.log('SOCKET ID COMP FALSE NUMER 1111111111')
  
              next_turn(turnArray, socket, player.room)
            }

          })
          


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
          
          

          function findRoundWinner(firstCardValue, findCardFunction, cardsArray, arrNumber, arr){          
  
          console.log('oejejjeje', firstCardValue)

          console.log(cardsArray)

          let firstCard = firstCardValue //firstCardValue
          let otherPlayerCards = cardsArray.slice(!0).flat()
          let matchingSuits = otherPlayerCards.filter(card => card.suit === firstCard.suit)
          let winner
          let losers
          
          arr.every(player => console.log('player: ', player.length))

          if(arr.every(player => findCardFunction(player.length)) === true && matchingSuits.length === 0){ //findCardFunction
            console.log("::::::::: ROUND FINISHED ::::::::::::::")

              winner = players.find(player => player.playedCards[arrNumber].suit === firstCard.suit)

              console.log(winner)

              winner.roundWinner = true

              losers = arr.filter(player => player !== winner)

              console.log('LOSEERS: ', losers)

              losers.map(loser => loser.roundWinner = false)

              
          }
            
          if(arr.every(player => findCardFunction(player.length)) === true && matchingSuits.length > 0){ //findCardFunction

              matchingSuits.push(firstCard)

              console.log('HEt complete plaatje: ', matchingSuits)

              // find de speler met de hogste kaart nu

              const winningValue = Math.max.apply(Math, matchingSuits.map(card => card.value))

              // now search winning card in matchingSuits

              const winningCard = matchingSuits.find(card => card.value === winningValue)

              console.log('The winningCarrdddd: ', winningCard)
              
              winner = players.find(player => player.playedCards.some(card => card.value === winningCard.value && card.suit === winningCard.suit))

              losers = arr.filter(player => player !== winner)

              console.log('LOSEERS: ', losers)

              losers.map(loser => loser.roundWinner = false)

              winner.roundWinner = true

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
        console.log(values.every(value => firstCardPlayed(value.length)))

        valuesSortedByRoom.forEach(room => {
          const player = players.find(player => player.playedCards.some(card => card.value === room[0][0].value && card.suit === room[0][0].suit))

          console.log(room.every(value => secondCardPlayed(value.length)) === true)
        
          if(room.every(value => firstCardPlayed(value.length)) === true) {
            console.log('valuessssss')
            // console.log(value)
  
            const firstPlayedCards = room.map(card => card[0])
  
            firstRoundWinner = findRoundWinner(room[0][0], firstCardPlayed, firstPlayedCards, 0, room)
            console.log("Round 1 WINNERRR", firstRoundWinner)
            io.to(firstRoundWinner.id).emit('your turn', `You won this round!!`)
          }

          if(room.length === 2 && room.every(value => firstCardPlayed(value.length)) === false && room.every(value => secondCardPlayed(value.length)) === false){
            console.log('SOCKET ID COMP false NRRR 222222, 22PLAYERSSSS')
            
            next_turn(turnArray, socket, player.room)
          }
          if(room.length > 2 && room.every(value => firstCardPlayed(value.length)) === false && room.every(value => secondCardPlayed(value.length)) === false && room.every(value => thirdCardPlayed(value.length)) === false){
            console.log('SOCKET ID COMP false NRRR 222222')
  
            next_turn(turnArray, socket, player.room)
          }

          

          if(room.every(value => secondCardPlayed(value.length)) === true) {

          const secondPlayedCards = values.map(card => card[1])

          const lastRoundWinner = findLastRoundWinner(players, true)

          const latsPlayedCardRoundWinner = lastRoundWinner.playedCards[1]

          const cardToCheck = secondPlayedCards.find(card => card.suit === latsPlayedCardRoundWinner.suit && card.value === latsPlayedCardRoundWinner.value)

          console.log('THE CARD THAT SHOULD BE CHECKED FIRST ::::', cardToCheck)
          console.log('THE CARD THAT SHOULD BE CHECKED FIRST ::::', lastRoundWinner)

          // second played cards needs to be passed to the function
          secondRoundWinner = findRoundWinner(cardToCheck, secondCardPlayed, secondPlayedCards, 1, room)
          console.log("Round 2 WINNERRR", secondRoundWinner)

          //when the last round winner wins cards get played double...

          io.to(secondRoundWinner.id).emit('your turn', `You won second round!!`)
        }
        
          

        if(room.every(value => thirdCardPlayed(value.length)) === true) {
          // console.log('valuessssss 2222')
          // check which array has a item first

          console.log('==================THIRD ROUND WAS FINSHED====================')

          const thirdPlayedCards = values.map(card => card[2])

          console.log(thirdPlayedCards)

          const lastRoundWinner = findLastRoundWinner(players, true)

          const latsPlayedCardRoundWinner = lastRoundWinner.playedCards[2]

          const cardToCheck = thirdPlayedCards.find(card => card.suit === latsPlayedCardRoundWinner.suit && card.value === latsPlayedCardRoundWinner.value)

          console.log('THE CARD THAT SHOULD BE CHECKED FIRST ::::', cardToCheck)


          thirdRoundWinner = findRoundWinner(cardToCheck, thirdCardPlayed, thirdPlayedCards, 2, room)
          console.log("Round 3 WINNERRR", thirdRoundWinner)
          io.to(thirdRoundWinner.id).emit('your turn', `You won third round!!`)
        }

        })
        

        // if(values.every(value => firstCardPlayed(value.length)) === true) {
        //   console.log('valuessssss')
        //   // console.log(value)

        //   const firstPlayedCards = values.map(card => card[0])

        //   firstRoundWinner = findRoundWinner(values[0][0], firstCardPlayed, firstPlayedCards, 0)
        //   console.log("Round 1 WINNERRR", firstRoundWinner)
        //   io.to(firstRoundWinner.id).emit('your turn', `You won this round!!`)
        // }
        
        // if(players.length === 2 && values.every(value => firstCardPlayed(value.length)) === false && values.every(value => secondCardPlayed(value.length)) === false && values.every(value => thirdCardPlayed(value.length)) === false){
        //   console.log('SOCKET ID COMP false NRRR 222222')

        //   next_turn(socket, cards)
        // }
        // if(players.length > 2 && values.every(value => firstCardPlayed(value.length)) === false && values.every(value => secondCardPlayed(value.length)) === false && values.every(value => thirdCardPlayed(value.length)) === false && arrayfiedClientList[turn] === socket.id){
        //   console.log('SOCKET ID COMP false NRRR 222222')

        //   next_turn(socket, cards)
        // }
        
        console.log('2 cards have been played by every player', values.every(value => secondCardPlayed(value.length)) === true)

        valuesSortedByRoom.forEach(room => console.log(room.every(value => secondCardPlayed(value.length)) === true))


        // if(values.every(value => secondCardPlayed(value.length)) === true) {

        //   const secondPlayedCards = values.map(card => card[1])

        //   const lastRoundWinner = findLastRoundWinner(players, true)

        //   const latsPlayedCardRoundWinner = lastRoundWinner.playedCards[1]

        //   const cardToCheck = secondPlayedCards.find(card => card.suit === latsPlayedCardRoundWinner.suit && card.value === latsPlayedCardRoundWinner.value)

        //   console.log('THE CARD THAT SHOULD BE CHECKED FIRST ::::', cardToCheck)
        //   console.log('THE CARD THAT SHOULD BE CHECKED FIRST ::::', lastRoundWinner)

        //   // second played cards needs to be passed to the function
        //   secondRoundWinner = findRoundWinner(cardToCheck, secondCardPlayed, secondPlayedCards, 1)
        //   console.log("Round 2 WINNERRR", secondRoundWinner)

        //   //when the last round winner wins cards get played double...

        //   io.to(secondRoundWinner.id).emit('your turn', `You won second round!!`)
        // }
        
          

        // if(values.every(value => thirdCardPlayed(value.length)) === true) {
        //   // console.log('valuessssss 2222')
        //   // check which array has a item first

        //   console.log('==================THIRD ROUND WAS FINSHED====================')

        //   const thirdPlayedCards = values.map(card => card[2])

        //   console.log(thirdPlayedCards)

        //   const lastRoundWinner = findLastRoundWinner(players, true)

        //   const latsPlayedCardRoundWinner = lastRoundWinner.playedCards[2]

        //   const cardToCheck = thirdPlayedCards.find(card => card.suit === latsPlayedCardRoundWinner.suit && card.value === latsPlayedCardRoundWinner.value)

        //   console.log('THE CARD THAT SHOULD BE CHECKED FIRST ::::', cardToCheck)


        //   thirdRoundWinner = findRoundWinner(cardToCheck, thirdCardPlayed, thirdPlayedCards, 2)
        //   console.log("Round 3 WINNERRR", thirdRoundWinner)
        //   io.to(thirdRoundWinner.id).emit('your turn', `You won third round!!`)
        // }

        


        
        console.log('ALL PLAYERS LAYED 4 CARDS DWON : ', players.every(player => allCardsPlayed(player.playedCards.length)))
        players.map(player =>  console.log('true card legth: ', player.playedCards.length))  
        //   // check if everyone played 4 cards
          if(players.every(player => allCardsPlayed(player.playedCards.length)) === true){
            // this is what happens when everyone played his last card
            //Math.max?

            console.log('==================FOURTH ROUND WAS FINSHED====================')

            const fourthPlayedCards = values.map(card => card[3])

            console.log('4th card: ', fourthPlayedCards)

            // const values = findHighestCard(players)

            // console.log('fereereerre', values)

            // const maxRow = values.map( (row) => row.pop());

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

            players.forEach(player => player.playedCards = [])

            

            io.in(winner.room).emit("round over", 'get ready for the next round')

          }

          const toBeRemovedFromHand = cards.cards.findIndex(
            card => card.code == playedCard.code
          );


          cards.cards.splice(toBeRemovedFromHand, 1);

          const thisRoom = findRoom(players, socket.id, currentRoom)


          io.in(player.room).emit("show played card", playedCard);
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
// }

server.listen(port, () => {
  console.log(`Dev app listening on port: ${port}`);
});
