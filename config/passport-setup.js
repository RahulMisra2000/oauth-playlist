const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const keys = require('./keys');
const User = require('../models/user-model');


//*** Remember since we are persisting all users in a mongoDB and it creates a unique key (called _id) for each record added. It is that 
//    key that we are using to uniquely idenitfy a user. I believe id is an alias for _id 
passport.serializeUser((user, done) => {
    done(null, user.id);                    //*** The 2nd parameter is shoved inside a cookie
});


passport.deserializeUser((id, done) => {    //*** When the cookie is sent by the browser to the server then the content of the cookie
                                            //    is copied into the first parameter .....id field in here
    User.findById(id).then((user) => {
        done(null, user);                   //    The 2nd parameter is shoved into the req object
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
                                // ** When the above done method is called then right after control goes to the 
                                //    serializeUser() and the above parameters are passed through
                        } else {                                                // if not, create user in our db
                                new User({                                      // Mongo creates a unique id for each record added
                                    googleId    : profile.id,
                                    username    : profile.displayName,
                                    thumbnail   : profile._json.image.url
                                    })
                                 .save().then((newUser) => {
                                    console.log('created new user: ', newUser);
                                    done(null, newUser);
                                    // ** When the above done method is called then right after control goes to the 
                                    //    serializeUser() and the above parameters are passed through
                                 });
                        }
                });
    })
   //** Google calls this function and hydrates it with the tokens after it receives back the Authorization Code
   
);
