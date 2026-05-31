const express = require('express');
const cors = require('cors');
const passport = require('./config/passport');

const eventRoutes = require('./routes/eventRoutes');
const emailRoutes = require('./routes/emailRoutes');
const gmailRoutes = require('./routes/gmailRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.use("/api/events", eventRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/gmail", gmailRoutes);
app.use("/api/auth", authRoutes);

app.get('/', (req, res) => {
      res.json({
            "message": "Welcomeee to Eventra Backend!"
      })
});

module.exports = app;