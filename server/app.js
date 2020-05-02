require("dotenv").config();
const nunjucks = require("nunjucks");
const router = require("./routes/router.js");
const path = require("path");
const port = process.env.PORT || 3000;
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

function allCardsPlayed(arrLength){
  return arrLength === 4;
}

function next_turn(socketId, cards){
  // players[turn].myTurn = false
  console.log('sooookcccerrrttty iiidd: ', socketId)
  turn = ++currentTurn % players.length
  // client.emit('your turn', "it's your turn sonny")
  // io.to(socketId).emit('your turn', "it's your turn sonny")

  // emit only to next player
  
  console.log("next turn triggered", 'player: ', players[turn] ,  'turn: ',turn)

  io.to(players[turn].id).emit('your turn', "it's your turn sonny", cards)

  
}

function findHighestCard(arr){
  return arr.map(player => player.playedCards.map(cards => cards.value))
}

function findPlayer(array, socketId){
  return array.find(player => player.id == socketId);
}


app
  .use(express.static(path.join(__dirname, "static")))
  .get("/", router.homeRoute);

function gameMaker(deck) {
  io.on("connection", socket => {
    //step1: first make a room
    // console.log('soccket: ', socket)
    socket.on("send-nickname", nickname => {
      // Taking turns

      //Step 1: give every player object a keyvalue pair of myTurn: false x
      //Step 2: make a function which loops through the length of players and sets one object's myTurn property to true x
      //Step 3: send the player's myTurn property to the client 
      //Step 4: If the client gets a myTurn property of true then add an eventlistener to player's hand
      //Step 5: display the name of the player whos's turn it is
      players.push({ id: socket.id, name: nickname, playedCards: [], points: 0, myTurn: false });

      // console.log(users)

      socket.join("game", async () => {
        
        console.log(nickname, " joined ze game");

        // if more than 4 players make new room
        const clients = io.sockets.adapter.rooms["game"].length;
        


        //  console.log(clients)

        // io.in('game').emit('big-announcement', 'the game will start soon');

        const drawnCards = await Api.drawCards(deck.deck_id, 4);

        drawnCards.cards.map(card => {
          // console.log('vaaaluee: ', card.value.length)

          if(card.value.length === 1 || card.value === '10') card.value = +card.value


        })

      //   socket.on('pass turn', () => {
      //   if(players[turn].id === socket.id){
      //     // console.log('oeeelaaaala: ', players[turn].id)
      //     // players[turn].myTurn = true
      //     // socket.emit('make cards clickable')
      //     next_turn()
      //   }
      // })
    

        // io.to(socket.id).emit("pass turn", findPlayer(players, socket.id))

        // every client draws 4 cards at start of the game
        io.to(socket.id).emit("deal cards", drawnCards, findPlayer(players, socket.id).myTurn);
        
        
        io.to(players[0].id).emit('your turn', "it's your turn sonny", drawnCards)
        


        console.log('playaHatazz: ', players)


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
            next_turn(socket.id, cards)
          }
          


          console.log('Poooooooolooooo: ', players)

          

          // push every playedCard in the playedCards array
          
          
          // check if everyone played 4 cards
          if(players.every(player => allCardsPlayed(player.playedCards.length)) === true){
            // this is what happens when everyone played his last card
            //Math.max?


            const values = findHighestCard(players)

            const maxRow = values.map( (row) => row.pop());

            //this finds the highest lat played card
            const winningValue = Math.max.apply(null, maxRow)

            //Find the player that played the winning value card

            //step 1 players.find(player => player.playedCards.pop() === same as highest vlaue)
            const winner = players.find(player => player.playedCards[3].value === winningValue)
            

            io.in("game").emit("winner", winner.name)


          }


          const playedCardStack = await Api.cardPiles(
            deck.deck_id,
            "playedCards",
            playedCard.code
          );

          const playerStacks = await Api.cardPiles(
            deck.deck_id,
            nickname,
            playedCard.code
          );

          // console.log("playerStacks: ", playerStacks);

          const playerStacksList = await Api.pileList(deck.deck_id, nickname);

          // console.log("playerStacksList: ", playerStacksList);

          //check if card is still in game by checking whether the card is in the playedCardArray

          const listofPlayedCards = await Api.pileList(deck.deck_id, "playedCards");

          const burnedCards = listofPlayedCards.piles.playedCards.cards;


          if (Data.hasDuplicates(burnedCards)) {
            console.log("Duplicate cards found");
          } else {
            console.log("No duplicates found!");
          }

          const toBeRemovedFromHand = cards.cards.findIndex(
            card => card.code == playedCard.code
          );


          cards.cards.splice(toBeRemovedFromHand, 1);

          // console.log("PlayedCards ", burnedCards);

          let drawnCard = await Api.drawCards(deck.deck_id, 1);

          cards.cards.push(drawnCard.cards[0]);
          //checkup
          //if(burnedCards.contains(drawnCard))

          // update remaining cards
          cards.remaining = drawnCard.remaining;

          // cards.cards.push(drawnCard.cards[0])

          // console.log('with drawn card: ', cards)

          io.in("game").emit("clicked card", playedCard, cards);
          // io.to(socket.id).emit('drawn card', drawnCard.cards[0], cards);
        });

        // io.in('game').emit('show played card', 'the game will start soon');
        // socket.on('play card', )
      });
    });

    //step 2: whem players are in the room get a new card deck

    const user = () => users.find(user => user.id == socket.id);


    // socket.on("send-nickname", async nickname => {
    //   users.push({ id: socket.id, name: nickname, answers: [] });

    //   socket.broadcast.emit(
    //     "user connected",
    //     `${user().name} entered the room`
    //   );
    //   connectCounter++;

    //   if (connectCounter === 2) {
    //     users.forEach(async user => {
    //       // const deck = await drawCards()
    //       // socket.broadcast.to(user.id).emit('challenge', await drawCards())
    //     });
    //   }
    // });

    socket.on("disconnect", () => {
      if (user() !== undefined) {
        socket.broadcast.emit(
          "server message",
          `${user().name} has left the chat`
        );
        connectCounter--;
      }
    });

    socket.on("chat message", msg => {
      if (user().id == socket.id) {
        user().answers.push(msg);
        // let keepCount = countInArray(user().answers, randomWord.word);
        console.log("keepCount:", keepCount);
        if (keepCount === randomWord.size)
          io.sockets.emit("winner", `${user().name} won the game!`);
      }

      console.log("users saving answers: ", users);

      socket.broadcast.emit("chat message", `${user().name}: ${msg}`);
    });
  });
}

server.listen(port, () => {
  console.log(`Dev app listening on port: ${port}`);
});
