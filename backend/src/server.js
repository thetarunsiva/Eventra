require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const { startEmailCron } = require("./cron/emailCron");
const port = process.env.PORT || 5000;

connectDB();
startEmailCron();

app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
});