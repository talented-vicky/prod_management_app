const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bp = require('body-parser');
const multer = require('multer');
const ejs = require('ejs')

require('dotenv').config();
const database_connection_url = process.env.database_connection_url;

// routes
const authRoute = require('./routes/auth');
const adminRoute = require('./routes/admin');
const shopRoute = require('./routes/shop');


// methods and functions
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

/* session middlewares */
const app = express();
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

/* routes middleware */
app.use(shopRoute)
app.use(authRoute);
app.use('/admin', adminRoute)


mongoose.connect(database_connection_url)
    .then(conn => {
        console.log('Connected to mongoDB')
        app.listen(4000)
    })
    .catch(err => {
        console.log(err)
    })