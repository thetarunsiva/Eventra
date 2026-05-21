const { fetchLatestEmails } = require('../services/gmailService');

const testGmailFetch = async (req, res) => {
      try {
            const emails = await fetchLatestEmails(); 
            res.status(200).json({
                  message: "Emails fetched successfully",
                  emails,
            });
      }
      catch (error) {
            console.error("Error fetching emails:", error);
            res.status(500).json({
                  message: "Server error while fetching emails",
            });
      }
};

module.exports = {
      testGmailFetch,
};
