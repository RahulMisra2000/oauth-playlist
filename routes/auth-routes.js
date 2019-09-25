const router = require('express').Router();
const passport = require('passport');

// auth login
router.get('/login', (req, res) => {
    res.render('login', { user: req.user });
});

// auth logout
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

// auth with google+
//**************** The scope we are requesting ****************************
router.get('/google', passport.authenticate('google', {scope: ['profile']}));


// callback route for google to redirect to hand control to passport to use code to grab profile info
//********* Google will call this endpoint. This is the Authorized Redirect URI we specified both in the Google Developer Console and
//          also when configuring the Google Strategy in another file in this project
//          Google will send the Authrization code as a query string. When passport.authenticate() sees a code in the query string
//          it no longer takes the user to the consent screen/credential entering page, as in the case if the call ABOVE, BUT instead makes 
//          a request to google to send back the tokens. Google obliges by calling the function that was provided at the time Google 
//          Strategy was configured
router.get('/google/redirect', passport.authenticate('google'), (req, res) => {
    // res.send(req.user);
    res.redirect('/profile');
});


module.exports = router;
