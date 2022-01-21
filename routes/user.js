const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const nodemailer = require('nodemailer');
const Email = require('email-templates');


const transporter = nodemailer.createTransport({
    // service: 'SendinBlue', 
    host: 'smtp-relay.sendinblue.com',
    port: 587,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS
    }
});


const mail = new Email({
    views: { root: './routes/templates', options: { extension: 'ejs' } },
    message: {
        from: 'Chategorize <info@chategorize.com>',

    },
    preview: false,
    send: true,
    transport: transporter


});


router.get('/register', (req, res) => {
    res.render('users/register')
})

router.post('/register', catchAsync(async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Chategorize!');
            res.redirect('/');


            mail.send({
                template: 'welcome',
                message: {
                    to: email
                },
                locals: {
                    name: username
                }
            })
                .then(console.log)
                .catch(console.error);

        })

    } catch (e) {
        req.flash('error', e.message)

    }
}))

router.get('/login', (req, res) => {
    res.render('users/login')

})

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', `Welcome back!`);
    const redirectUrl = req.session.returnTo || '/';
    delete req.session.returnTo;
    res.redirect(redirectUrl);

})

router.get('/logout', (req, res) => {
    delete req.session.returnTo;
    req.logout();
    req.flash('success', 'Bye for now!')
    res.redirect('/');
})


module.exports = router;