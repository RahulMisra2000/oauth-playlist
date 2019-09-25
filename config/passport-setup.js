const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const keys = require('./keys');
const User = require('../models/user-model');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
        done(null, user);
    });
});

passport.use(
    new GoogleStrategy({
            //***** The next two we will get from Google's Developer Console once we create client credentials there ***************
            clientID: keys.google.clientID,
            clientSecret: keys.google.clientSecret,    

            //***** This is the same as the Authrorized Redirect URI we specified in the Google Developer Console *****************
            //      It is where google will send back response to user authenticating at google
            callbackURL: '/auth/google/redirect'
    }, 
       // 2nd parameter of the Google Strategy    
       //** Google calls this function and hydrates it with the tokens after it receives back the Authorization Code
       (accessToken, refreshToken, profile, done) => {
                // check if user already exists in our own db
                User.findOne({googleId: profile.id})
                    .then((currentUser) => {
                        if(currentUser){                                        // already have this user
                                console.log('user is: ', currentUser);
                                done(null, currentUser);
                        } else {                                                // if not, create user in our db
                                new User({
                                    googleId    : profile.id,
                                    username    : profile.displayName,
                                    thumbnail   : profile._json.image.url
                                    })
                                 .save().then((newUser) => {
                                    console.log('created new user: ', newUser);
                                    done(null, newUser);
                                 });
                        }
                });
    })
   //** Google calls this function and hydrates it with the tokens after it receives back the Authorization Code
   
);
