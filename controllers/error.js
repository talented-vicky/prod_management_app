exports.errorPage = (req, res, next) => {
    res.status(404).render('default-error', {
        title: "Error Page",
        path: '/400',
        isAuth: req.isLoggedIn
    })
}

exports.serverError = (req, res, next) => {
    res.status(500).render('server-error', {
        title: "Server Error",
        path: '/500',
        isAuth: req.isLoggedIn
    })
}