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
            "tech talk",
            "hands-on",
            "competition",
            "contest",
            "conference",
            "summit",
            "meetup",
            "orientation",
            "demo day",
            "networking",
            "innovation",
            "buildathon",
            "coding challenge",
            "roadshow",
            "masterclass",
            "venue",
            "register now",
            "limited seats",
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
            "office bearer",
            "core committee",
            "nomination",
            "applications",
            "login code",
            "unsubscribe",
            "newsletter",
            "reminder:",
            "internship",
            "recruitment",
            "placement",
            "cgpa",
            "marks",
            "attendance",
            "bus routes",
            "otp",
            "verification code",
      ];

      const strongEventSignals = [
            "register now",
            "join us for",
            "we are excited to invite",
            "event will be held",
            "scan the qr code",
            "open to all students",
            "venue:",
            "date:",
            "time:",
      ];

      strongEventSignals.forEach(signal => {
            if (content.includes(signal)) score += 25;
      });
      positiveKeywords.forEach(keyword => {
            if (content.includes(keyword)) score += 15;
      });
      negativeKeywords.forEach(keyword => {
            if (content.includes(keyword)) score -= 20;
      });

      if (
            content.includes("ieee") ||
            content.includes("club") ||
            content.includes("ssn.edu.in")
      ) {
            score += 20;
      }
      if (
            content.includes("http") ||
            content.includes("bit.ly") ||
            content.includes("forms.gle")
      ) {
            score += 10;
      }
      if (!email.subject || email.subject.trim() === "") {
            score -= 20;
      }
      const hasStrongPositiveSignal =
            content.includes("hackathon") ||
            content.includes("workshop") ||
            content.includes("webinar") ||
            content.includes("seminar") ||
            content.includes("community huddle") ||
            content.includes("register now");
      score = Math.max(score, 0);
      score = Math.min(score, 100);
      console.log(`Email from: ${email.from} with subject: "${email.subject}" has a raw score of: ${score}`);
      return {
            isEvent: (score >= 30 || (hasStrongPositiveSignal && score >= 15)),
            score,
      };
};

module.exports = {
      classifyEventEmail,
};