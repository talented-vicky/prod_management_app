const  bcrypt = require('bcryptjs')
const { validationResult } = require('express-validator')

const User = require('../models/user')


const technicalErrorCtr = (nexxx, err) => {
    const error = new Error(err)
    error.httpStatusCode = 500
    return nexxx(error)
}

exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        title: 'Login',
        path: '/main-login',
        isAuth: false,
        loginError: null,
        inputValue: {
            email: "",
            password: ""
        },
        errorsArray: [] // for css dynamic style
    })
}

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        title: 'Signup',
        path: '/main-signup',
        isAuth: false,
        signupError: null,
        inputValue: {
            fullname: "",
            email: "",
            password: "",
            lat: 0,
            long: 0,
        },
        errorsArray: []
    })
}

exports.postLogin = (req, res, next) => {
    const userEmail = req.body.email
    const userPassword = req.body.password
    const errors = validationResult(req)

    // work on dynamic styling error on login form

    User.findOne({email: userEmail})
        .then(user => {
            if(!user){
                return res.status(422).render('auth/login', {
                    title: 'Login',
                    path: '/main-login',
                    loginError: "The user was not found in database, please sign up",
                    inputValue: {
                        email: userEmail,
                        password: userPassword
                    },
                    errorsArray: errors.array() // for css dynamic style
                })
            }
            bcrypt.compare(userPassword, user.password)
                .then(passwordMatch => {
                    if(!passwordMatch){
                        return res.status(422).render('auth/login', {
                            title: 'Login',
                            path: '/main-login',
                            loginError: 'password entered is incorrect',
                            inputValue: {
                                email: userEmail,
                                password: userPassword
                            },
                            errorsArray: errors.array()
                        })
                    }
                    req.session.isLoggedIn = true
                    req.session.user = user
                    console.log('Passwords match and session initiated for this user')
                    return req.session.save(err => {
                        console.log(err)
                        res.redirect('/')
                        // I normally don't need to save but just to be sure my session
                        // is saved before I continue due to that milisec gap stuff noticed

                        // because a redirect is normally fired  independent of the session
                        // and may finish hence trigger rendering of a new page before the 
                        // session was updated in the server and db
                    })
                })
                .catch(compareErr => console.log(compareErr))
        })
        .catch(err => technicalErrorCtr(next, err))
}

exports.postSignup = (req, res, next) => {
    const { fullname, lat, long } = req.body
    const userEmail = req.body.email
    const userPassword = req.body.password
    
    const errors = validationResult(req)

    if(!errors.isEmpty()){ 
        // false means there are errors
        console.log(errors.array()) // check this to understand code in the future
        
        return res.status(422).render('auth/signup', {
            title: 'Signup',
            path: '/main-signup',
            isAuth: false,
            signupError: errors.array()[0].msg,
            inputValue: {
                fullname,
                email: userEmail,
                lat, long,
                password: userPassword,
            },
            errorsArray: errors.array()
        })
    }
    bcrypt
        .hash(userPassword, 12)
        .then(hashedPassword => {
            const user = new User({
                fullname,
                email: userEmail,
                password: hashedPassword,
                address: {
                    "type": "Point",
                    "coordinates": [ lat, long]
                }
            })
            return user.save()
        })
        .then(result => {
            console.log('Successfully created account')
            res.redirect('/login')

            // return transporter.sendMail({
            //     to: userEmail,
            //     from: 'victorotubure7@gmail.com',
            //     subject: 'Account creation successful',
            //     html: '<h1> Congratulations, you have successfully created an account. Please go back to the login page and login with your email</h1>'
            // })
        })
        .catch(err => console.log(err))
}

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err)
        res.redirect('/')
    })
}


// we typically use a session when we have sensitive data but
// by convention, you simply store user authentication status in them

// attached to every session is a cookie (an identifier which tells which
// user a session belongs to => so they're basically identifiers, nothing more)
