module.exports.isLoggedIn = (req, res, next) => {
    console.log("REQ.USER:", req.user)
    req.session.returnTo = req.originalUrl
    if (!req.isAuthenticated()) {
        req.flash('error', 'Please sign in first');
        return res.redirect('/login');
    }
    next();
}