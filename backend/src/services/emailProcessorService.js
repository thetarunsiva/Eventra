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

const isSimilarTitle = (title1, title2) => {
      const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim().split(/\s+/);
      const words1 = normalize(title1);
      const words2 = normalize(title2);
      const commonWords = words1.filter(word => words2.includes(word));
      const similarity = commonWords.length / Math.max(words1.length, words2.length);
      return similarity >= 0.7;
}

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
                  console.log("Merged Extraction:", parsedEvent);
            }

            // Check if same event already exits in the server
            if (!parsedEvent.title) {
                  console.log(`Event from email titled "${email.subject}" is rejected due to missing critical fields even after GenAI fallback`);
                  continue;
            }
            
            // Check if same event already exists..
            if (parsedEvent.eventDate) {
                  const existingEvents = await Event.find({ eventDate: parsedEvent.eventDate });
                  const isDuplicate = existingEvents.some(existing => isSimilarTitle(existing.title, parsedEvent.title));
                  if (isDuplicate) {
                        console.log(`Event titled "${parsedEvent.title}" is rejected as similar event already exists!`);
                        continue;
                  }
            }
            else {
                  const existingEvent = await Event.findOne({ title: parsedEvent.title });
                  if (existingEvent) {
                        console.log(`Event titled "${parsedEvent.title}" is rejected as similar event already exists!`);
                        continue;
                  }
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
            if (!confidenceData.isTrustedSender) {
                  console.log(`Event titled "${parsedEvent.title}" is from untrusted sender: ${email.from}`);
                  confidenceData.status = "Pending";
            }

            const newEvent = new Event({
                  title: parsedEvent.title,
                  description: parsedEvent.description,
                  fullEmailBody: parsedEvent.fullEmailBody,
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