

const { roomSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
const Room = require('./models/room');


module.exports.isLoggedIn = (req, res, next) => {
    req.session.returnTo = req.originalUrl
    if (!req.isAuthenticated()) {
        req.flash('error', 'Please sign in first');
        return res.redirect('/login');
    }
    next();
}

module.exports.validateRoom = (req, res, next) => {
    const { error } = roomSchema.validate(req.body);
    console.log(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}