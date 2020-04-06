function homeRoute(req, res){
    res.render('index.html', {
        pageTitle: 'it Works!'
    })
}

function chatRoute(req, res){
    res.render('chat.html')
}

module.exports = { homeRoute, chatRoute }