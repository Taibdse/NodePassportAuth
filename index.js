const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const fs = require('fs');

const app = express();

const port = 3000;

app.set('views', './views');
app.set('view engine', 'ejs');

app.use(session({ 
    secret: "cats", 
    cookie: { maxAge: 1000*60*5 },
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
    res.render('index');
});

app.route('/login')
.get((req, res) =>  res.render('login'))
.post(passport.authenticate('local', { 
    failureRedirect: '/login',
    successRedirect: '/loginOK',
    failureFlash: true
 }));
// .post(passport.authenticate('local'), (req, res) => {
//     res.redirect('/loginOK');
// });
// .post((req, res) => {
//     console.log(req.body);
// })

app.get('/loginOK', (req, res) => res.send('Login OK'));

app.get('/private', (req, res) => {
    if(req.isAuthenticated()){
        res.send('Welcome to private page');
    }else{
        res.send('You have not logged in!!');
    }
});


passport.use(new LocalStrategy({ 
    usernameField:'username', 
    passwordField:'password' 
},
    (username, password, done) => {
    console.log(username);
    fs.readFile('./userDB.json', (err, data) => {
        console.log(data);
        if(err) return console.log(err.message);
        const db = JSON.parse(data);
        const userRecord = db.find(u => u.usr === username);
        if(userRecord && userRecord.pwd === password){
            return done(null, userRecord);
        } else {
            return done(null, false);
        }
    })
}));


passport.serializeUser((user, done) => {
    done(null, user.usr);
});

passport.deserializeUser((name, done) => {
    fs.readFile('./userDB.json', (err, data) => {
        const db = JSON.parse(data);
        const userRecord = db.find(u => u.usr === name);
        if(userRecord){
            return done(null, userRecord);
        }else{
            return done(null, false);
        }
    })
});


app.listen(port, () => console.log(`Server started on port ${port}`));