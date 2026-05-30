const calculateConfidenceScore = (email, parsedEvent) => {
      let score = 0;

      if (parsedEvent.title) {
            score += 20;
      }
      else {
            score -= 20;
      }
      if (parsedEvent.eventDate) {
            score += 20;
      }
      else {
            score -= 25;
      }
      if (parsedEvent.eventTime) {
            score += 10;
      }
      if (parsedEvent.location) {
            score += 5;
      }
      if (parsedEvent.registrationLink) {
            score += 20;
      }
      if (parsedEvent.club) {
            score += 10;
      }
      if (parsedEvent.tags && parsedEvent.tags.length > 0){
            score += 5;
      }

      let status = "Rejected";
      score = Math.min(score, 100);
      score = Math.max(score, 0);
      
      if (score >= 85) {
            status = "Approved";
      }
      else if (score >= 40) {
            status = "Pending";
      }
      console.log(`Calculated confidence score: ${score} for event titled "${parsedEvent.title}" from email: ${email.from}`);
      return {
            score,
            status,
      };
};

module.exports = {
      calculateConfidenceScore,
};