const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bp = require('body-parser');
const multer = require('multer');
const session = require('express-session');
const csrf = require('csurf');
const flash = require('connect-flash');
const mongodbStore = require('connect-mongodb-session')(session);

const User = require('./models/user');
const errorCtrl = require('./controllers/error');

require('dotenv').config();
const database_connection_url = process.env.database_connection_url;

// routes
const authRoute = require('./routes/auth');
const adminRoute = require('./routes/admin');
const shopRoute = require('./routes/shop');


// methods and functions
const dbStore = new mongodbStore({
    uri: database_connection_url,
    collection: 'sessions'
})

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
        // passing null as error value
    },
    filename: (req, file, cb) => {
        const namepref = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, namepref + '-' + file.originalname)
        // using current date for image uniqueness
    }
})
const filter = (req, file, cb) => {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
        cb(null, true)
    } else {
        cb(null, false)
    }
}

/* function calls */
const app = express();
const csrfProtect = csrf(); // cookie helps identify server-side session


/* middlewares for json data, files, styles, and images */
app.use(bp.urlencoded({extended: false})) // all inputs to texts
app.use(multer({ storage: storage, fileFilter: filter}).single('image')) // single param is form name

app.use(express.static(path.join(__dirname, 'public'))) // accessing static files
app.use('/images', express.static(path.join(__dirname, 'images')))
// files in images are treated like they're in the root folder hence
// the need to condition express to add the /images checking for requests
// that begin with /images and serving them statically


/* templating engine */
app.set('view engine', 'ejs')
app.set('views', 'views')


/* session and dialogue middlewares */
app.use(session({
    secret: '9ihjod890w3pjekdkeioeo',
    resave: false, saveUninitialized: false,
    store: dbStore
}));

app.use(csrfProtect);
app.use(flash );

app.use((req, res, next) => {
    if(!req.session.user){
        return next() // if there's no session, jump to session middleware
    }
    User.findById(req.session.user._id)
        .then(user => {
            if(!user){
                return next()
            }
            req.user = user
            next() // this enables to get to the next middleware
        })
        .catch(err => {
            next(new Error(err)) 
            // must use next to throw error inside async funcs
            // this is better than consoling err cause it allows me 
            // reach next middleware
        })
})

app.use((req, res, next) => {
    res.locals.isAuth = req.session.isLoggedIn
    res.locals.csrfToken = req.csrfToken() // key gotten from logout form
    next()
    // locals lets me pass the above into every view rendered
    // I had to pass <input type="hidden" name="_csrf" value="<%= csrfToken %>"> 
    // into all post views
})


/* routes middleware */
app.use(shopRoute)
app.use(authRoute);
app.use('/admin', adminRoute)


/* error middlewares */

app.get('/500', errorCtrl.serverError);
app.use(errorCtrl.errorPage);

app.use((error, req, res, next) => {
    // only reached when next is called with error passed as its arg
    res.render('server-error', {
        pageTitle: 'Server Error',
        path: '/500',
        isAuth: req.isLoggedIn
    })
})


mongoose.connect(database_connection_url)
    .then(conn => {
        console.log('Connected to mongoDB')
        app.listen(4000)
    })
    .catch(err => {
        console.log(err)
    })