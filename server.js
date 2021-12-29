const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const mongoose = require('mongoose');
const Message = require('./models/message');
const Room = require('./models/room');
const path = require('path');
const morgan = require('morgan');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const { isLoggedIn } = require('./middleware');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const userRoutes = require('./routes/user');
const helmet = require('helmet');

//array so I can identify all users and their sockets
let users = [];

// to access id of room

let roomId;
let reqChatname;

//connect to db
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
app.use(mongoSanitize());

const sessionConfig = {
    name: 'session',
    secret: 'mischievemanaged',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash());
app.use(helmet({ contentSecurityPolicy: false }));

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

/////////////////////////////////////////////////////////routes//////////////////////////////////////////////////////

app.get('/', (req, res) => {
    res.render(__dirname + '/views/index.ejs');
});

app.get('/chat', isLoggedIn, async (req, res) => {
    const chats = await Room.find({ users: req.user._id });
    res.render(__dirname + '/views/chat.ejs', { currUser: req.user, chats });
});

app.get('/new', isLoggedIn, (req, res) => {
    res.render(__dirname + '/views/new.ejs', { currUser: req.user });
});

app.post('/chatname', isLoggedIn, catchAsync(async (req, res) => {
    if (!req.body.chatname) throw new ExpressError('No chatname provided', 400);
    const person = await User.findOne({ username: req.user.username })
    const newChat = new Room({ name: req.body.chatname, owner: person._id }, { autoIndex: false });
    if (!newChat.users.includes(person._id)) {
        newChat.users.push(person);
    }

    await newChat.save();
    reqChatname = req.body.chatname;
    roomId = newChat._id;

    // redirect here to the newly made chatroom
    res.redirect(`/chatname/${newChat._id}`);
}));

app.get('/chatname/:id', isLoggedIn, catchAsync(async (req, res) => {
    const users = await User.find({});
    const { id } = req.params;

    const room = await Room.findById(id);
    res.render(__dirname + '/views/chatname.ejs', { currUser: req.user, users, room });
}));

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Oh No, Something Went Wrong...:("
    res.status(statusCode).render('error', { err })
})


/////////////////////////////////////////////////socket.io starts here//////////////////////////////////////////////////
io.on('connection', (socket) => {
    console.log("SOCKET CONNECTION")
    socket.on('sendUserName', function (username) {
        socket.username = username;
        users.push({ name: socket.username, id: socket.id });
        console.log(users);

    });

    let wantedRoom;

    socket.on('joinRoom', async function ({ chatname, id }) {
        wantedRoom = await Room.findById(id); // roomId is undefined

        if (!wantedRoom) {
            //if room doesn't exist: person creating room
            // const person = await User.findOne({ username: socket.username });
            // console.log(`if room doesnt exist this is person: ${person}`)
            // wantedRoom = new Room({ name: chatname, owner: person._id }, { autoIndex: false });
            // wantedRoom.users.push(person)
            // wantedRoom.save();
            console.log(`sorry ${chatname} does not exist`)
        }
        else {
            const person = await User.findOne({ username: socket.username });
            console.log(`if room DOES exist this is room: ${wantedRoom}`)

            if (!wantedRoom.users.includes(person._id)) {
                wantedRoom.users.push(person)
                wantedRoom.save();
            }
        }

        let wantedRoomId = id;
        let currMembers;

        Room.findById(wantedRoomId).populate({ path: 'users', select: 'username -_id' }).then((result) => {

            // all people in the room
            currMembers = result.users;
            io.in(wantedRoomId).emit('chatMembers', currMembers);

        })
        // retrieve message history from db
        Message.find({ room: wantedRoomId }).populate('sender').then((result) => {
            // console.log(`outputting message...${result}`)
            io.in(wantedRoomId).emit('outputMessage', result)
        })

        socket.join(wantedRoomId);
        // console.log(`${socket.username} joined the ${chatname} room`)
        // console.log(socket.rooms)
        // console.log(`wanted room is ${wantedRoom}`)
        // console.log(wantedRoomId)

        socket.on('addFriend', async function (person) {
            try {
                const user = await User.findOne({ username: person });

                if (!wantedRoom.users.includes(user._id)) {
                    wantedRoom.users.push(user)
                    wantedRoom.save();

                }
            }

            catch (e) {
                console.log(`ADD FRIEND ERROR`, e);
            }
        })

        socket.on('chat message', async function (msg) {
            const messageSender = await User.findOne({ username: socket.username })
            const message = new Message({ message: msg, sender: messageSender, time: moment().format('LLLL'), room: wantedRoom });
            message.save().then(() => {
                const toSend = { user: socket.username, msg: msg }
                io.in(wantedRoomId).emit('chat message', toSend);
            })
        });
    })

    //only triggers when socket disconnects
    socket.on('disconnect', function () {
        var connectionMessage = socket.username + " Disconnected from Socket " + socket.id;
        console.log(connectionMessage);
        socket.broadcast.emit('userLeft', socket.username);
    });
});


// running server
server.listen(5000, () => {
    console.log('listening on *:5000');
});