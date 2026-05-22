const cron = require('node-cron');
const { processEmails } = require('../services/emailProcessorService');

const startEmailCron = () => {
      cron.schedule('*/10 * * * *', async () => {
            console.log('Running email processing cron job every 10 minutes..');
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