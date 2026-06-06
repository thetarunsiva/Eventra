require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");
const { startEmailCron } = require("./cron/emailCron");
const { processEmails } = require("./services/emailProcessorService");
const port = process.env.PORT || 5000;

const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server, {
      cors: {
            origin: "*",
      },
});

io.on("connection", (socket) => {
      console.log("User connected: ", socket.id);
      io.on("disconnect", () => {
            console.log("User disconnected: ", socket.id);
      });
});

connectDB();
startEmailCron();
processEmails();

server.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
});