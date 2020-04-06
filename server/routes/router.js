function homeRoute(req, res){
    res.render('index.html', {
        pageTitle: 'it Works!'
    })
}

module.exports = { homeRoute }