const { fetchLatestEmails, fetchFullEmailBody } = require('./gmailService');
const { classifyEventEmail } = require('./eventClassifier');
const { parseEventFromEmail } = require('./eventParser');
const { calculateConfidenceScore } = require('./confidenceScorer');
const { extractEventWithGenAI } = require('./geminiService');

const Event = require('../models/Event');

const needGenAI = (parsedEvent) => {
      return (
            !parsedEvent.title ||
            !parsedEvent.eventDate ||
            !parsedEvent.eventTime
      );
};

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
            const regexEvent = parseEventFromEmail(`${email.subject}\n${fullBody}`);
            let genAIEvent = null;
            let parsedEvent = regexEvent || {};

            // Calling Gemini API if critical fields are missing..
            if (needGenAI(parsedEvent)) {
                  console.log(`Using GenAI fallback for: ${email.subject}`);
                  genAIEvent = await extractEventWithGenAI(`${email.subject}\n${fullBody}`);
                  if (genAIEvent && genAIEvent.isRealEvent) {
                        parsedEvent = {
                              ...parsedEvent,
                              ...Object.fromEntries(
                                    Object.entries(genAIEvent)
                                    .filter(([_, value]) => value !== null)
                              ),
                        };
                  }
                  console.log("Regex Extraction:", regexEvent);
                  console.log("Gemini Extraction:", genAIEvent);
                  console.log("Merged Extraction:", parsedEvent);
            }

            // Check if same event already exits in the server
            if (!parsedEvent.title || !parsedEvent.eventDate) {
                  console.log(`Event from email titled "${email.subject}" is rejected due to missing critical fields even after GenAI fallback`);
                  continue;
            }
            const existingEvent = await Event.findOne({
                  title: parsedEvent.title,
                  eventDate: parsedEvent.eventDate,
            });
            if (existingEvent) {
                  console.log(`Event titled "${parsedEvent.title}" already exists`);
                  continue;
            }
            if (genAIEvent && !genAIEvent.isRealEvent) {
                  console.log(`Event titled "${parsedEvent.title}" is rejected by GenAI as it is not a real event`);
                  continue;
            }

            // Calculate confidence score for parsed event and decide whether to save it or not
            const confidenceData = calculateConfidenceScore(email, parsedEvent);
            if (confidenceData.status === "Rejected") {
                  console.log(`Event titled "${parsedEvent.title}" is rejected due to poor confidence score below 40`);
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