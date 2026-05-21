const { fetchLatestEmails, fetchFullEmailBody } = require('./gmailService');
const { classifyEventEmail } = require('./eventClassifier');
const { parseEventFromEmail } = require('./eventParser');
const { calculateConfidenceScore } = require('./confidenceScorer');

const Event = require('../models/Event');

const processEmails = async () => {
      const emails = await fetchLatestEmails();
      const processedEvents = [];
      for (const email of emails) {
            // Classify email as event or not
            const classification = classifyEventEmail(email);
            // Skip non-event emails
            if (!classification.isEvent) {
                  continue;
            }
            // Parse event details from event email
            const fullBody = await fetchFullEmailBody(email.id);
            const parsedEvent = parseEventFromEmail(`${email.subject}\n${fullBody}`);
            const confidenceData = calculateConfidenceScore(email, parsedEvent);

            // Check if same event already exits in the server
            const existingEvent = await Event.findOne({
                  title: parsedEvent.title,
                  eventDate: parsedEvent.eventDate,
            });
            if (existingEvent || confidenceData.status === "Rejected"){
                  continue;
            }
            
            const newEvent = new Event({
                  title: parsedEvent.title,
                  description: parsedEvent.description,
                  club: parsedEvent.club,
                  eventDate: parsedEvent.eventDate,
                  eventTime: parsedEvent.eventTime,
                  registrationDeadline: parsedEvent.registrationDeadline,
                  registrationLink: parsedEvent.registrationLink,
                  location: parsedEvent.location,
                  tags: parsedEvent.tags,
                  status: confidenceData.status,
            });
            await newEvent.save();

            processedEvents.push({
                  gmailId: email.id,
                  subject: email.subject,
                  from: email.from,
                  confidenceScore: confidenceData.score,
                  parsedEvent: {
                        ...parsedEvent,
                        status: confidenceData.status, 
                  },
            });
      }
      return processedEvents;
};     

module.exports = {
      processEmails,
};