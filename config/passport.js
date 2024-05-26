/* Imports */
const user = require('../models/user.js')
const bcrypt = require('bcrypt')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

/* Initialisations & Middlewares */
passport.use(new LocalStrategy({usernameField: 'email', passwordField: 'password'}, (email, password, done) => {
    console.log("hitting passport")
    user.findOne({ email: email }).then(async (requiredUser) => {
        if(requiredUser){
            done(null, requiredUser);
        }
        else{
            done(null, false);
        }
    }).catch((error) => {
        done(error.message)
    })
}));
passport.serializeUser(function(user, done) {
    // @ts-ignore
    done(null, user.id);
});
passport.deserializeUser(function(id, cb) {
    user.findById(id, function (err, user) {
        if (err) { return cb(err)}
        cb(null, user);
    });
});