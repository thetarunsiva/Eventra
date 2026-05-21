const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

const gmail = google.gmail({ 
      version: 'v1', 
      auth: oauth2Client }
);

const fetchLatestEmails = async () => {
      try {
            const res = await gmail.users.messages.list({
                  userId: 'me',
                  maxResults: 20,
                  labelIds: ['INBOX'],
            });
            console.log(res.data);
            const messages = res.data.messages || [];
            const emailData = [];
            for (const message of messages) {
                  const email = await gmail.users.messages.get({
                        userId: 'me',
                        id: message.id,
                  });
                  const headers = email.data.payload.headers;
                  const subject = headers.find(h => h.name === 'Subject')?.value || '';
                  const from = headers.find(h => h.name === 'From')?.value || '';
                  const snippet = email.data.snippet || '';

                  emailData.push( { id: message.id, subject, from, snippet} );
            }
            return emailData;
      }
      catch (error) {
            console.error('Error fetching emails..', error);
            return [];
      }
}

const extractBodyFromParts = (parts) => {
      for (const part of parts) {
            if (part.mimeType === 'text/plain' && part.body?.data) {
                  return part.body.data;
            }
            if (part.mimeType === 'text/html' && part.body?.data) {
                  return part.body.data;
            }
            if (part.parts) {
                  const nestedResult = extractBodyFromParts(part.parts);
                  if (nestedResult) {
                        return nestedResult;
                  }
            }
      }
      return '';
};

const fetchFullEmailBody = async (messageId) => {
      try {
            const email = await gmail.users.messages.get({
                  userId: 'me',
                  id: messageId,
            });
            const payload = email.data.payload;
            let bodyData = '';

            if (payload.body?.data) {
                  bodyData = payload.body.data;
            }

            else if (payload.parts) {
                  bodyData = extractBodyFromParts(payload.parts);
            }

            if (!bodyData) {
                  return '';
            }

            bodyData = bodyData
                  .replace(/-/g, '+')
                  .replace(/_/g, '/');

            const decodedBody = Buffer.from(
                  bodyData,
                  'base64'
            ).toString('utf-8');

            return decodedBody;
      } 
      catch (error) {
            console.error('Error fetching email body..', error);
            return '';
      };
};

module.exports = {
      fetchLatestEmails,
      fetchFullEmailBody,
};