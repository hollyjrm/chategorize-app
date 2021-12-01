const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const mongoose = require('mongoose');
const Message = require('./models/message');
const path = require('path');
const morgan = require('morgan');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const { isLoggedIn } = require('./middleware');

const userRoutes = require('./routes/user');

let users = [];

mongoose.connect('mongodb://localhost:27017/chatapp', {
    useNewUrlParser: true

})
    .then(() => {
        console.log("MONGO CONNECTION OPEN")
    }).catch(e => {
        console.log("OH NO MONGO ERROR")
        console.log(e);
    })

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(express.static('public/'));
app.use(morgan('tiny'));
app.use(express.urlencoded({ extended: true }));

const sessionConfig = {
    secret: 'mischievemanaged',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }

}
app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', userRoutes);

app.get('/', (req, res) => {
    res.render(__dirname + '/views/index.ejs');
});

app.get('/chat', isLoggedIn, (req, res) => {
    console.log(`This is from chat req.user: ${req.user}`);


    res.render(__dirname + '/views/chat.ejs', { currUser: req.user });
});

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))

})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Oh No, Something Went Wrong...:("
    res.status(statusCode).render('error', { err })

})


io.on('connection', (socket) => {
    Message.find().then((result) => {
        socket.emit('outputMessage', result)
    })
    console.log('a user connected');

    socket.on('sendUserName', function (username) {
        socket.username = username;

        users.push({ name: socket.username, id: socket.id });
        console.log(users);

        // io.emit('sendUserName', userName);
    });

    socket.on('userConnected', function (userName) {
        socket.username = userName;
        io.emit('userConnected', userName)
        console.log(`${userName} joined`)
    })


    socket.on('chat message', function (msg) {

        const message = new Message({ message: msg, sender: socket.username });
        message.save().then(() => {
            const toSend = `${socket.username}: ${msg}`
            io.emit('chat message', toSend);
        })


    });

    socket.on('disconnect', function () {

        var connectionMessage = socket.username + " Disconnected from Socket " + socket.id;
        console.log(connectionMessage);
        socket.broadcast.emit('userLeft', socket.username);
    });
});

server.listen(5000, () => {
    console.log('listening on *:5000');
});