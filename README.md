# Real-Time Web @cmda-minor-web · 2019-2020
# Project title

[link to deploy][screenshot of website]

[![Netlify Status](https://api.netlify.com/api/v1/badges/9aec17a8-142c-40c1-a2b2-ad3e73f9f652/deploy-status)](https://app.netlify.com/sites/rtw/deploys)


<details>
  <summary><strong>Table of Contents</strong> (click to expand)</summary>

<!-- toc -->

- [✅ To-do](#--to-do)
- [📋 Concept](#---concept)
- [👯🏿‍ Features (+ wishlist)](#------features----wishlist-)
- [⚙️ Installation](#---installation)
- [🧑🏼‍ Actor Diagram](#------actor-diagram)
- [↔️ Interaction diagram](#---interaction-diagram)
- [🌍 Design patterns](#---design-patterns)
- [👍🏽 Best practices](#-----best-practices)
- [🗃 Data](#---data)
  * [🐒 API](#---github-api)
    + [Endpoint(s)](#endpoint-s-)
    + [Rate limiting](#rate-limiting)
  * [💽 Data cleaning](#---data-cleaning)
- [🏫 Assignment](#---assignment)
  * [Learning goals](#learning-goals)
  * [Week 1 - Hello Server 🐒](#week-1---hello-api---)
  * [Week 2 - Sharing is caring 🛠](#week-2---design-and-refactor---)
  * [Week 3 - Let’s take this show on the road 🎁](#week-3---wrapping-up---)
  * [Rubric](#rubric)
- [ℹ️ Resources](#---resources)
  * [Credits](#credits)
  * [Small inspiration sources](#small-inspiration-sources)
- [🗺️ License](#----license)

<!-- tocstop -->

</details>

## ✅ To-do
- [x] Init readme
- [x] Init wiki
- [ ] Tutorial socket.io



## 📋 Concept
_What does your app do, what is the goal? (passing butter)_
**Chatbot**
- Users can add quotes to a quotelist, then request a random one via the `quote`-command.
- Chatbot responds with quotes when specific words are used (kinda like _Slackbot_-responses)

**Multiple contributors**
- Users can add things to household shopping list


**Effects**
- Trigger on-screen effects when a specific word is used (for example: `fireworks`)

## 👯🏿‍ Features (+ wishlist)
_What would you like to add (feature wishlist / backlog)?_

- [x] one thing
- [ ] second something
- [ ] third thing

## ⚙️ Installation
Clone this repository to your own device:
```bash
$ git clone https://github.com/deannabosschert/real-time-web-1920.git
```
Then, navigate to this folder and run:

```bash
npm run dev
```
, or:

```bash
npm install
```

#### Dependencies
```json
{
  "name": "my-package",
  "version": "1.0.0",
  "scripts": {
    "iets": "iets"
  },
  "devDependencies": {
    "iets": "*"
  }
}
```


## 🧑🏼‍ Actor Diagram
_Which actors are there in your application? (actor diagram)_
![actor diagram](https://github.com/deannabosschert/real-time-web-1920/blob/master/src/img/actordiagram.png)

## ↔️ Interaction diagram
_How does flowed interaction through the application? (interaction diagram)_
![interaction diagram](https://github.com/deannabosschert/real-time-web-1920/blob/master/src/img/interactiondiagram.png)

## 🌍 Design patterns

- opsomming
- van
- patterns

## 👍🏽 Best practices

- Work in branches, even if it's a one-man project. It helps staying focused on one feature until it's finished, and keeps your from doing 10 different things at the same time. Saves you merge conflicts, too.
- ^ also helps with 'closing' a feature, so you are more likely to move on to the next. Too little time, too much ideas.
- Commit early, commit often.
- Make single-purpose commits.
- Always fix your .gitignore-contents asap; node_modules or the like won't ever be pushed that way.
- Styling comes last. It's gonna change anyways so most of the time, it's better to fix the technical stuff first.
- Don't use declarations in the global scope.
- Start your project with writing down the future function names (pre-actors, basically).
- Make your own template for your readme
- Google, google, google. 99% of the time, it'll get you to the solution of your problem.
- Set timers for solving problems that aren't super relevant in the current sprint but you do would like to work on; 25 mins tops, otherwise you'll be stuck with this for too long.
- Make an actor diagram halfway through, it's a great reminder to refactor the code.
- Explicitly limit the scope of your functions
- Remember that most problems/features that have to do with the UI, can be fixed with mainly CSS.
- Do not use .innerHTML
- If there's an error, walk through your code from the top/beginning; explain it to your rubber ducky and state where certain data is passed.
- Implement useful error handling.

## 🗃 Data

### 🐒 API
_What external data source is featured in your project and what are its properties?_

Somethingsomething

#### Properties

#### Rate limiting

### 💽 Data cleaning
_What has been done with the fetched data?_What has been done with the initial data? Cleaning pattern?

```js
```

outcome:
```json
```

## 🏫 Assignment
<details>
  <summary></strong> (click to expand)</summary>
> During this course you will learn how to build a meaningful real-time application. You will learn techniques to setup an open connection between the client and the server. This will enable you to send data in real-time both ways, at the same time.


### Learning goals

- _You can deal with real-time complexity_
- _You can handle real-time client-server interaction
- _You can handle real-time data management_
- _You can handle multi-user support_


### Week 1 - Hello Server 📤

Goal: Build and deploy a unique barebone real-time app

### Week 2 - Sharing is caring 👯

Goal: Store, manipulate and share data between server-client

### Week 3 - Let’s take this show on the road 🛣️

Goal: Handle data sharing and multi-user support

</details>

### Rubric

[Rubric- detailed rating of my project](https://github.com/deannabosschert/real-time-web-1920/wiki/Rubric)
![screenshot of rubric](https://github.com/deannabosschert/real-time-web-1920/blob/master/src/img/documentation/rubric.png)

## ℹ️ Resources

### Credits

- Our superamazingteachers at the [minor WebDev @CMD](https://github.com/cmda-minor-web/)

### Small inspiration sources

- one source
- second source

## 🗺️ License

Author: [Deanna Bosschert](https://github.com/deannabosschert) , license by
[MIT](https://github.com/deannabosschert/real-time-web-1920/blob/master/LICENSE)
