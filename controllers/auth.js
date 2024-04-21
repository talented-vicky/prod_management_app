const  bcrypt = require('bcryptjs')
const { validationResult } = require('express-validator')
const { welcomeUser } = require('../config/sendmail')

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

exports.postLogin = async (req, res, next) => {
    const userEmail = req.body.email
    const userPassword = req.body.password
    const errors = validationResult(req)

    try {
        const user = await User.findOne({email: userEmail})
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
        
        const passwordMatch = await bcrypt.compare(userPassword, user.password)
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
        })

    } catch (error) {
        technicalErrorCtr(next, error)
    }
}

exports.postSignup = async (req, res, next) => {
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

    const hashedPassword = await bcrypt.hash(userPassword, 12)
    const user = new User({
        fullname,
        email: userEmail,
        password: hashedPassword,
        address: {
            "type": "Point",
            "coordinates": [ Number(long), Number(lat)]
        }
    })

    const newUser = await user.save()
    console.log('Successfully created account')
    
    welcomeUser(newUser.email)
    res.redirect('/login')
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
