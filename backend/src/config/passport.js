const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { processEmails } = require('../services/emailProcessorService');

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

                  try {
                        const email = profile.emails[0].value.toLowerCase();
                        const currEmailDomain = email.split('@')[1];
                        const allowedDomains = ["ssn.edu.in", "snu.edu.in"];
                        if (!allowedDomains.includes(currEmailDomain)) {
                              return done(new Error('Unauthorized domain, Please use your college email to login (@ssn.edu.in / @snu.edu.in)'), null);
                        }

                        let user = await User.findOne({ googleId: profile.id });
                        if (!user) {
                              user = await User.create({
                                    googleId: profile.id,
                                    email: email,
                                    name: profile.displayName,
                                    picture: profile.photos?.[0]?.value,
                                    googleRefreshToken: refreshToken,
                              });
                              setTimeout(async () => {
                                    try {
                                          await processEmails();
                                    }
                                    catch (error) {
                                          console.error(`Error processing emails for new user ${user.email}: `, error.message);
                                    }

                              }, 0);
                        }
                        else if (refreshToken) {
                              user.googleRefreshToken = refreshToken;
                              await user.save();
                        }
                        return done(null, user);
                  }
                  catch (error) {
                        return done(error, null);
                  }
            }
      )
);

module.exports = passport;