module.exports = (req, res, next) => {
    if(!req.session.isLoggedIn){
        console.log("Access denied, please login")
        return res.redirect('/login')
    }
    next() // the absence of this gave me sleepless night
    // I couln't reach the next middleware
}

// checking authentication status with session on server side
// this helps for routes protection, preventing user from manipulating the web
// page to make changes


// I embed the token into every request that changes the user's state => this is 
// where csurf comes in; checking every request if that token is present (useful against fake sites sending
// requests to my backend. Although they have access to my session, their
// request will be missing the csrf token, hence blocked by my server and the
// cool part is that a new token is generated for every new request)

// hence I apply this to my postrequests (which is responsible for data changes)
// since the csurf package will always look for the token in every post 
// request I added a line of code (<input type="hidden" name="_csrf" value="<%= csrfToken %>">)
// to every post request body