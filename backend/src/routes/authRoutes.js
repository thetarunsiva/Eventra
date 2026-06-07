const express = require("express");
const jwt = require("jsonwebtoken");
const passport = require("../config/passport");
const User = require("../models/User");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");


const router = express.Router();
router.get(
      '/google',
      passport.authenticate('google', { 
            scope: ['profile', 'email', 'https://www.googleapis.com/auth/gmail.readonly'],
            accessType: 'offline',
            prompt: 'consent',
      })
);

router.get(
      '/google/callback',
      passport.authenticate('google', {
            session: false,
            failureRedirect: '/login',
      }),

      async (req, res) => {
            const token = jwt.sign(
                  {
                        _id: req.user._id,
                        userId: req.user._id,
                        role: req.user.role,
                  },
                  process.env.JWT_SECRET,
                  {
                        expiresIn: '7d',
                  }
            );

            /* This was for testing purpose during backend dev..
            res.json({
                  success: true,
                  token: token,
                  expiresIn: '7d',
                  user: {
                        id: req.user._id,
                        name: req.user.name,
                        email: req.user.email,
                        picture: req.user.picture,
                        role: req.user.role,
                  },
            });
            */

           const frontendUrl = `${process.env.FRONTEND_URL}/auth-success?token=${token}`;
           res.redirect(frontendUrl);
      }
);

router.get(
      '/me',
      authMiddleware,
      async (req, res) => {
            try {
                  const user = await User.findById(req.user.userId);
                  if (!user) {
                        return res.status(404).json({
                              success: false,
                              message: "User not found!",
                        });
                  }
                  res.json({
                        success: true,
                        user: {
                              id: user._id,
                              name: user.name,
                              email: user.email,
                              picture: user.picture,
                              role: user.role,
                        },
                  });
            }
            catch (error) {
                  res.status(500).json({
                        success: false,
                        message: "Server error while fetching user data!",
                  });
            }
      }
);

router.get(
      '/admin-test',
      authMiddleware,
      adminMiddleware,
      (req, res) => {
            res.json({
                  success: true,
                  message: "Welcome Admin..",
            });
      }
);

router.post(
      '/demo-login',
      async (req, res) => {
            try {
                  const role = req.body.role || 'user';
                  let user;
                  if (role === 'Admin') {
                        user = await User.findOne({ email: "demoadmin@eventra.com" });
                  }
                  else {
                        user = await User.findOne({ email: "tarun2410336@ssn.edu.in" });
                  }
                  if (!user) {
                        return res.status(404).json({
                              success: false,
                              message: "Demo user not found!",
                        });
                  }
                  const token = jwt.sign(
                        { _id: user._id, userId: user._id, role: user.role },
                        process.env.JWT_SECRET,
                        { expiresIn: '7d' },
                  );
                  res.json({ token });
            }
            catch (error) {
                  res.status(500).json({
                        success: false,
                        message: "Server error during demo login!",
                  });
            }
      }
)

module.exports = router;
