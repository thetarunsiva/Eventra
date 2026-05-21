const { parseEventFromEmail } = require("../services/eventParser");
const { processEmails } = require("../services/emailProcessorService");

const parseEmail = async (req, res) => {
      try {
            const { emailContent } = req.body;
            if (!emailContent) {
                  return res.status(400).json({
                        message: "Email content is required",
                  });
            }
            const parsedEvent = parseEventFromEmail(emailContent);

            // Send parsed result
            res.status(200).json({
                  message: "Email parsed successfully",
                  parsedEvent,
            });

      } 
      catch (error) {
            console.error("Error parsing email:", error);
            res.status(500).json({
                  message: "Server error while parsing email",
            });
      }
};

const processEmailEvents = async (req, res) => {
      try {
            const events = await processEmails();
            res.status(200).json({
                  message: "Emails processed successfully",
                  events,
            });
      }
      catch (error) {
            console.error("Error processing emails:", error);
            res.status(500).json({
                  message: "Server error while processing emails",
            });
      }
};

module.exports = {
      parseEmail,
      processEmailEvents,
};