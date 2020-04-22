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
let connectCounter = 0;

function countInArray(array, what) {
  return array.filter(item => item == what).length;
}


app
  .use(express.static(path.join(__dirname, "static")))
  .get("/", router.homeRoute)
  .get("/chat", router.chatRoute);

function gameMaker(deck) {
  io.on("connection", socket => {
    //step1: first make a room

    socket.on("send-nickname", nickname => {
      socket.join("game", async () => {
        console.log(nickname, " joined ze game");

        // if more than 4 players make new room
        const clients = io.sockets.adapter.rooms["game"].length;

        //  console.log(clients)

        // io.in('game').emit('big-announcement', 'the game will start soon');

        const drawnCards = await Api.drawCards(deck.deck_id, 4);

        // every client draws 4 cards at start of the game
        io.to(socket.id).emit("cards in hand", drawnCards);

        //Step 1 Add a playername
        //Step 2 Make player draw cards
        //Step 3 Each clicked card should end up in a player's pile
        //Step 4 To check who's the winner the values of the last play card should be compaired

        socket.on("clicked card", async (playedCard, cards) => {
          //logs the card that has been played
          //in order to erase the card from the deck this card has to be found in the card deck

          console.log("playedCard: ", playedCard);

          console.log("le deck", deck);

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

          console.log("playerStacks: ", playerStacks);

          const playerStacksList = await Api.pileList(deck.deck_id, nickname);

          console.log("playerStacksList: ", playerStacksList);

          //check if card is still in game by checking whether the card is in the playedCardArray

          const listofPlayedCards = await Api.pileList(deck.deck_id, "playedCards");

          const burnedCards = listofPlayedCards.piles.playedCards.cards;

          // console.log('Pile of played cards:', playedCardStack)

          if (Data.hasDuplicates(burnedCards)) {
            console.log("Duplicate cards found");
          } else {
            console.log("No duplicates found!");
          }

          const toBeRemovedFromHand = cards.cards.findIndex(
            card => card.code == playedCard.code
          );

          console.log("burning card: ", toBeRemovedFromHand);

          cards.cards.splice(toBeRemovedFromHand, 1);

          console.log("PlayedCards ", burnedCards);

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


    socket.on("send-nickname", async nickname => {
      users.push({ id: socket.id, name: nickname, answers: [] });

      socket.broadcast.emit(
        "user connected",
        `${user().name} entered the room`
      );
      connectCounter++;

      if (connectCounter === 2) {
        users.forEach(async user => {
          // const deck = await drawCards()
          // socket.broadcast.to(user.id).emit('challenge', await drawCards())
        });
      }
    });

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
        let keepCount = countInArray(user().answers, randomWord.word);
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
