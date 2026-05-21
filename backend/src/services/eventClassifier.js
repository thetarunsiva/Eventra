const classifyEventEmail = (email) => {
      const content = `
            ${email.subject}
            ${email.from},
            ${email.snippet}
      `.toLowerCase();
      
      let score = 0;
      const positiveKeywords = [
            "hackathon",
            "workshop",
            "bootcamp",
            "seminar",
            "webinar",
            "event",
            "speaker",
            "session",
            "registration",
            "join us",
            "community",
      ];
      const negativeKeywords = [
            "transport",
            "holiday",
            "nptel",
            "admin",
            "circular",
            "hostel",
            "feedback",
            "password",
            "new sign in",
            "security alert",
            "timetable",
            "exam",
            "fee",
      ];
      positiveKeywords.forEach(keyword => {
            if (content.includes(keyword)) score += 20;
      });
      negativeKeywords.forEach(keyword => {
            if (content.includes(keyword)) score -= 30;
      });
      if (
            content.includes("ieee") ||
            content.includes("club") ||
            content.includes("ssn.edu.in")
      ) {
            score += 25;
      }
      return {
            isEvent: score >= 30,
            score,
      };
};

module.exports = {
      classifyEventEmail,
};