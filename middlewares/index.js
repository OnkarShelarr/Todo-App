function logger(req, res, next){
        console.log("New Request: ", new Date().toLocaleString(), ", Method: ", req.method, ", URL: " + req.url)
        next()
}

function isAuthenticated(req, res, next) {
    console.log("---auth--- ",  req.headers.authorization )
    if(!req.headers.authorization || req.headers.authorization === "null"  ) {
        return res.status(200)
        .json({ 
            redirect: true
        })
    }
    next()
}

module.exports = {
    logger,
    isAuthenticated
}