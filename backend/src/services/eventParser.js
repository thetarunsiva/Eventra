const parseEventFromEmail = (emailContent) => {
      // Final structured event object
      const eventData = {
            title: "",
            description: emailContent,
            fullEmailBody: emailContent, 
            club: "",
            eventDate: "",
            registrationDeadline: "",
            registrationLink: "",
            location: "",
            eventTime: "",
            tags: [],
            status: "Pending",
      };

      eventData.description = eventData.description.split("::DISCLAIMER::")[0].trim();

      const titleMatch = emailContent.match(
            /(?:Event Title|Title|Subject):\s*(.+)/i
      );
      if (titleMatch) {
            eventData.title = titleMatch[1].trim();
      }
      if (!eventData.title) {
            const lines = emailContent
                  .split("\n")
                  .map((line) => line.trim())
                  .filter((line) => line.length > 0);
            if (lines.length > 0) {
                  eventData.title = lines[0];
            }
      }
      eventData.title = eventData.title
      .replace(/^Invitation to Attend\s*/i, "")
      .replace(/^Invitation\s*/i, "")
      .replace(/^Greetings[,:\s]*/i, "")
      .trim();

      const clubMatch = emailContent.match(
            /(?:Club|Organized by|Organisation):\s*(.+)/i
      );
      if (clubMatch) {
            eventData.club = clubMatch[1].trim();
      }
      const teamMatch = emailContent.match(
            /Regards,[\s\S]*?\n([A-Za-z\s&.-]+(?:team|club|society|chapter|committee|department|association|cell|forum))/i
      );
      if (!eventData.club && teamMatch) {
            eventData.club = teamMatch[1]
                  .replace(/\./g, "")
                  .trim();
      }

      const dateMatch = emailContent.match(
            /(?:Event Date|Date):\s*(.+)/i
      );
      if (dateMatch) {
            let rawDate = dateMatch[1].trim();
            // Remove "(Today)" etc..
            rawDate = rawDate.replace(/\(.*?\)/g, "").trim();
            const parts = rawDate.split("-");
            if (parts.length === 3) {
                  const [day, month, year] = parts;
                  eventData.eventDate = new Date(
                        Number(year),
                        Number(month) - 1,
                        Number(day)
                  );
            }
      }

      const deadlineMatch = emailContent.match(
            /(?:Registration Deadline|Deadline):\s*(.+)/i
      );
      if (deadlineMatch) {
            eventData.registrationDeadline = deadlineMatch[1].trim();
      }

      const locationMatch = emailContent.match(
            /(?:Venue|Location|At):\s*(.+)/i
      );
      if (locationMatch) {
            eventData.location = locationMatch[1].trim();
      }
      if (!eventData.location) {
             if (/(google meet|zoom|cisco webex|microsoft teams|online)/i
            .test(emailContent)) {
                  eventData.location = "Online";
            }
      }
      const timeMatch = emailContent.match(
      /(?:Time|Event Time):\s*(.+)/i
      );
      if (timeMatch) {
            eventData.eventTime = timeMatch[0];
      }

      const linkMatch = emailContent.match(
            /https?:\/\/[^\s]+/i
      );
      if (linkMatch) {
            eventData.registrationLink = linkMatch[0];
      }

      const lowerCaseContent = emailContent.toLowerCase();
      if (lowerCaseContent.includes("hackathon")) {
            eventData.tags.push("Hackathon");
      }
      if (lowerCaseContent.includes("workshop")) {
            eventData.tags.push("Workshop");
      }
      if (lowerCaseContent.includes("coding")) {
            eventData.tags.push("Coding");
      }
      if (lowerCaseContent.includes("ai")) {
            eventData.tags.push("AI");
      }
      if (lowerCaseContent.includes("web development")) {
            eventData.tags.push("Web Dev");
      }

      if (!eventData.title) {

            const fallbackTitleMatch = emailContent.match(
                  /(Hackathon|Workshop|Bootcamp|Seminar|Contest|Webinar)[^\n]*/i
            );
            if (fallbackTitleMatch) {
                  eventData.title = fallbackTitleMatch[0].trim();
            }
      }
      return eventData;
};

module.exports = {
      parseEventFromEmail,
};