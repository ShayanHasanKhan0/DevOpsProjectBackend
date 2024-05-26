/* Imports */
const express = require('express')
const api = require('./routes/api.js')
const passport = require('passport')
const session = require('express-session')
// const bodyParser = require('body-parser')
const mongoose = require ('mongoose')
const MongoStore = require('connect-mongo')
const cors = require('cors')
require('./config/passport')
require('dotenv').config()

/* Initialisations & Middlewares */
const app = express()
// app.use(bodyParser.json())
app.use(cors({ origin: process.env.BASE_URL_FRONTEND, credentials:true }))
app.use(express.urlencoded({extended: true}))
mongoose.connect(process.env.DATABASE_STRING, err =>{
    if(err){
        console.log(err)
    }
    else{
        console.log('DB connected sucessfully')
    }
})
const sessionStore = MongoStore.create({
    mongoUrl: process.env.DATABASE_STRING,
    collectionName: "sessions"
})
app.use(session({
    name: 'app.sid',
    secret: 'some secret',
    resave: true,
    rolling: true,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
    }
}))
app.use(passport.initialize());
app.use(passport.session());

/* Routes */
// app.use(api)
app.use('/api', api)

/* Listen */
app.listen(process.env.PORT, () => console.log(`Server running on port: http://localhost:${process.env.PORT}`))
