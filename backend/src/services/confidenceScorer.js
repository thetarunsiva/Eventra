const calculateConfidenceScore = (email, parsedEvent) => {
      let score = 0;

      if (email.from.includes("@ssn.edu.in")) {
            score += 30;
      }
      if (parsedEvent.title) {
            score += 15;
      }
      if (parsedEvent.eventDate) {
            score += 20;
      }
      if (parsedEvent.eventTime) {
            score += 10;
      }
      if (parsedEvent.location) {
            score += 10;
      }
      if (parsedEvent.registrationLink) {
            score += 10;
      }
      if (parsedEvent.club) {
            score += 20;
      }
      if (parsedEvent.tags && parsedEvent.tags.length > 0){
            score += 5;
      }

      let status = "Rejected";
      score = Math.min(score, 100);
      
      if (score >= 90) {
            status = "Approved";
      }
      else if (score >= 60) {
            status = "Pending";
      }
      return {
            score,
            status,
      };
};

module.exports = {
      calculateConfidenceScore,
};