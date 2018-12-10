const express = require('express');
const passport = require('passport');
const passportfb = require('passport-facebook').Strategy;
const session = require('express-session');
const mongoose = require('mongoose');
const db = require('./db');
const app = express();

mongoose.connect('mongodb://localhost:27017/test', (err) => {
    if(err) return console.log(err.message);
    console.log('database connected');
    db.find({})
    .then(res => console.log(res))
    .catch(err => console.log(err.message));
    // db.insertMany([{
    //     id: 123,
    //     name:'abc',
    //     email:'asdasd'
    // }]).then(() => console.log('insert successs'))
    // .catch(err => console.log(err.message));
});


app.set('views', './views');
app.set('view engine', 'ejs');

app.use(session({ secret: 'abc' }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => res.send('Welcome to passport facebook demo'));
app.get('/login2', (req, res) => res.render('login2'));
app.get('/auth/fb', passport.authenticate('facebook', { scope: 'email' }));
app.get('/auth/ok', passport.authenticate('facebook', { 
    failureRedirect: '/', 
    successRedirect: '/' 
}));

const port = 3000;

app.listen(port, () => console.log(`server Started on port ${port}`));

passport.use(new passportfb({
    clientID: '279147736124669',
    clientSecret: '6c03401e6e643d7951c21fe7865d361f',
    callbackURL: 'http://localhost:3000/auth/ok',
    profileFields: ['email', 'gender', 'locale', 'displayName']
}, (accessToken, refreshToken, profile, done) => {
    console.log(profile);
    db.findOne({ id: profile._json.id }, (err, user) => {
        if(err) return done(err);
        if(user) return done(null, user);
        let { name, email, id } = profile._json;
        const newUser = new db({
            id: id,
            name: name,
            email: email
        });
        newUser.save((err) => {
            return done(null, newUser);
        });
    })
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    db.findOne({ id }, (err, user) => {
        done(null, user);
    })
})