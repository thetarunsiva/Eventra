const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
      googleId: {
            type: String,
            required: true,
            unique: true,
            },
      name: {
            type: String,
            required: true,
            trim: true,
            },
      email: {
            type: String,
            required: true,
            unique: true,
            },
      picture: {
            type: String,
            },
      googleRefreshToken: {
            type: String,
            default: null,
      },
      isOnboarded: {
            type: Boolean,
            default: false,
      },
      lastEmailFetchedAt: {
            type: Date,
            default: null,
      },
      role: {
            type: String,
            required: true,
            enum: ['Admin', 'User'],
            default: 'User',
            },
      },
      {
            timestamps: true,
      }
);

module.exports = mongoose.model('User', userSchema);