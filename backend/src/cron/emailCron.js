const cron = require('node-cron');
const { processEmails } = require('../services/emailProcessorService');

const startEmailCron = () => {
      cron.schedule('0 * * * *', async () => {
            console.log('Running email processing cron job every hour..');
            try {
                  await processEmails();
                  console.log("Email ingestion completed successfully");
            }
            catch (error) {
                  console.error("Error processing emails in cron job", error);
            }
      });
};

module.exports = {
      startEmailCron,
};
