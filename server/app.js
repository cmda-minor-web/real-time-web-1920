require('dotenv').config()
const nunjucks = require('nunjucks')
const path = require('path')
const port = process.env.PORT || 3000
const express = require('express')
const app = express()

nunjucks.configure(`${__dirname}/view/pages`, {
    autoescape: true,
    express: app
});

app
    .use(express.static(path.join(__dirname, 'static')))
    .get('/', home)

function home(req, res){
    res.render('index.html', {
        pageTitle: 'it Works!'
    })
}

app.listen(port, () => {
    console.log(`Dev app listening on port: ${port}`)
})