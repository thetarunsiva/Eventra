const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const User = require('../models/User');

passport.use(
      new GoogleStrategy(
            {
                  clientID: process.env.GOOGLE_CLIENT_ID,
                  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                  callbackURL: 'https://eventra-ssn-backend.onrender.com/api/auth/google/callback',
            },
            async (accessToken, refreshToken, profile, done) => {
                  console.log("=== PASSPORT CALLBACK ===");
                  console.log("Profile ID:", profile.id);
                  console.log("Email:", profile.emails[0].value);
                  console.log("Refresh Token:", refreshToken);
                  try {
                        let user = await User.findOne({ googleId: profile.id });
                        if (!user) {
                              user = await User.create({
                                    googleId: profile.id,
                                    email: profile.emails[0].value,
                                    name: profile.displayName,
                                    picture: profile.photos?.[0]?.value,
                                    googleRefreshToken: refreshToken,
                              });
                        }
                        else if (refreshToken) {
                              user.googleRefreshToken = refreshToken;
                              await user.save();
                        }
                        done(null, user);
                  }
                  catch (error) {
                        done(error, null);
                  }
            }
      )
);

module.exports = passport;
