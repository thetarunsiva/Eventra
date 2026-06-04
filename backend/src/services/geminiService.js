const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
      model: "gemini-3.1-flash-lite",
});

const extractEventWithGenAI = async (emailContent) => {
      try {
            const result = await model.generateContent(`
            ROLE:
            You are an AI system that extracts structured campus event information from college emails.

            TASK:
            Analyze the email content and identify whether it contains a real student event, workshop, hackathon, seminar, webinar, competition, tech talk, club activity, or similar campus opportunity.

            CONTEXT:
            The emails belong to a college event aggregation platform called Eventra.
            The emails may contain noisy text, signatures, disclaimers, reply chains, HTML artifacts, and incomplete information.

            RULES:
            - Extract only information explicitly present in the email.
            - Analyse the full email body and Return a concise summary between 60 and 150 words, its significance, and any unique details into the description field.
            - Do NOT hallucinate missing fields.
            - If a field is unavailable, return null.
            - Ignore email signatures, disclaimers, unsubscribe text, and reply chains.
            - Prefer the main event title instead of generic subjects like "Reminder".
            - Normalize dates/times if possible.
            - Only classify genuine student-facing events.
            - If registration links are present, ensure the field is preceded by proper "http://" and is a valid URL format
            - If you find and analyse the event is an Online event, Dont replace the location field with YouTube live links, instead use relevant names, the location field should be "Online / YouTube / GMeet"
            - Ignore internships, login alerts, circulars, newsletters, OTPs, office bearer elections, and administrative announcements.
            - Normalize dates to YYYY-MM-DD format whenever possible.
            - Normalize times into readable standard format like 5:00 PM.
            - For tags, only include relevant keywords like "Hackathon", "Workshop", "AI", "Web Dev" etc. if they are explicitly mentioned in the email content, And also make it capitalized like "Web Dev", "Webinar" instead of Lowercase.

            FORMAT:
            Return ONLY valid raw JSON.
            Do NOT include markdown.
            Do NOT include explanation text.
            Do NOT wrap JSON inside code blocks.

            Use this exact schema:

            {
            "title": string | null,
            "description": string | null,
            "club": string | null,
            "eventDate": string | null,
            "eventTime": string | null,
            "registrationDeadline": string | null,
            "registrationLink": string | null,
            "location": string | null,
            "tags": string[] | [],
            "isRealEvent": boolean
            }

            EMAIL CONTENT:
            ${emailContent}
            `);
            const response = await result.response;
            const text = response.text();
            const cleanedText = text
                  .replace(/```json|```/g, '')
                  .replace(/```/g, '')
                  .trim();
            console.log(cleanedText);
            const parsedData = JSON.parse(cleanedText);
            return parsedData;
      }
      catch (error) {
            console.error('Error extracting event with GenAI.. ', error);
            return null;
      }
      
};

module.exports = { 
      extractEventWithGenAI,
};