const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
      {
            title: {
                  type: String,
                  required: true,
                  trim: true,
            },
            club: {
                  type: String,
            },
            eventDate: {
                  type: Date,
            },
            registrationDeadline: {
                  type: Date,
                  default: null,
            },
            description: {
                  type: String,  
                  required: true,
                  trim: true,
            },
            fullEmailBody: {
                  type: String,
                  default: "",
                  trim: true,
            },
            location: {
                  type: String,
                  default: "",
                  trim: true,
            },
            eventTime: {
                  type: String,
                  default: "",
                  trim: true,
            },
            registrationLink: {
                  type: String,
                  default: "",
                  trim: true,
            },
            tags: {
                  type: [String],
                  default: [],
            },
            status: {
                  type: String,
                  required: true,
                  enum: ['Pending', 'Approved', 'Rejected'],
                  default: 'Pending',
            },
      },
      {
            timestamps: true,
      }
);

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;