# Eventra

University email inboxes become noisy surprisingly fast!

A typical SSN student receives a constant stream of LMS notifications, attendance updates, department circulars, transport route announcements, library notices, placement communications, and newsletters from platforms they registered for months or even years ago.

Important event announcements arrive in the same inbox alongside all of this noise. Finding workshops, hackathons, competitions, speaker sessions, and club activities often means manually scanning hundreds of emails.

Eventra automates that process.

After authenticating with an SSN Gmail account, Eventra continuously scans incoming emails, identifies event-related announcements, extracts structured event information, filters duplicates, and builds a personalized event feed directly from the user's inbox.

Instead of searching for opportunities, students receive a curated event dashboard generated automatically from emails they already receive.

**Important:** Only `@ssn.edu.in` accounts can authenticate through Google OAuth.

---

# Live Demo

- Frontend: https://eventra-ssn.vercel.app/
- Backend: https://eventra-ssn-backend.onrender.com

Note:
Only @ssn.edu.in Google accounts can authenticate

---

# Processing Architecture

Most email-to-event systems take the expensive route:

```text
Email
  ↓
LLM
  ↓
Database
```

Every email is sent to an AI model regardless of whether it contains useful information.

Eventra intentionally avoids that design.

### Processing Pipeline

```text
Student Login
      │
      ▼
 Google OAuth
      │
      ▼
   Gmail API
      │
      ▼
 Email Fetching
      │
      ▼
Event Classifier
      │
      ├── Not an Event ──► Discard
      │
      ▼
 Regex Extraction
      │
      ├── Extraction Successful ──► Save Event
      │
      ▼
 Gemini Fallback
      │
      ▼
Confidence Scoring
      │
      ├── (Score >= 90) ──► Approved ──► Publish 
      │
      └── (Score >= 50) ──► Pending ──► Admin Review
      │
      ▼
    MongoDB
      │
      ▼
 Event Dashboard
```

### Design Decisions

=> Lightweight rule-based classification runs before any AI call

=> Obvious non-event emails are discarded immediately

=> Regex extraction handles structured announcements at near-zero cost

=> Gemini is invoked only when critical fields cannot be confidently extracted

=> Confidence scoring determines whether an event can be auto-approved

=> Human review is reserved for low-confidence edge cases

### Benefits

=> Reduced Gemini API usage

=> Lower inference costs

=> Smaller database footprint

=> Higher scalability as user count grows

---

# Smart Two-Phase Ingestion

A major engineering challenge was preventing repeated processing of already-seen emails.

A naive implementation would repeatedly scan the same inbox history every time a user logs in.

Eventra avoids this through a two-phase ingestion strategy.

### First-Time User (Onboarding)

=> Fetches a larger historical email window

=> Builds an initial event dataset

=> Marks the user as onboarded

```js
isOnboarded = true
```

=> Stores:

```js
lastEmailFetchedAt
```

---

### Returning User (Incremental Sync)

=> Queries Gmail only for emails received after:

```js
lastEmailFetchedAt
```

=> Previously processed emails are skipped entirely

=> Gemini is only invoked on newly discovered candidate emails

=> Processing complexity grows with new inbox activity rather than total inbox size

This transforms inbox processing from repeatedly scanning historical data into an incremental synchronization system.

---

# Automated Synchronization

Eventra is deployed on Render's free tier.

Instead of relying solely on scheduled jobs, Eventra uses application activity as a synchronization trigger.

### Login-Triggered Processing

=> User logs in

=> Backend wakes automatically

=> Email processing pipeline executes

=> New emails are discovered

=> New events are extracted

=> Dashboard remains updated

Because synchronization runs across registered users, the system maintains a continuously refreshed event dataset without requiring manual intervention.

---

# Extraction Strategy

### Stage 1 — Event Classification

=> Every email first passes through a lightweight classifier

=> Subject lines, sender metadata, keywords, and event indicators are evaluated

=> Non-event emails are rejected before any AI processing occurs

Examples:

=> LMS notifications

=> Transport updates

=> GitHub alerts

=> Promotional newsletters

=> Administrative announcements

---

### Stage 2 — Regex Extraction

=> Event metadata is extracted using deterministic parsing

=> Dates, deadlines, venues, registration links, and titles are identified through pattern matching

=> Successfully parsed emails never reach Gemini

=> This path is effectively free from an inference-cost perspective

---

### Stage 3 — Gemini Fallback

Gemini is treated as a fallback system rather than the primary parser.

=> Triggered only when important fields remain unresolved

=> Used for ambiguous formats and poorly structured announcements

=> Reduces AI requests dramatically compared to LLM-first architectures

---

### Model Selection

Eventra uses a lightweight Gemini Flash model.

Reasoning-heavy models were unnecessary because the problem is primarily structured information extraction.

The decision prioritizes:

=> Lower latency

=> Lower inference costs

=> Higher scalability

=> Faster onboarding processing

---

# Confidence Scoring

Every extracted event receives a confidence score.

The score considers:

=> Sender trustworthiness

=> Event-specific keywords

=> Registration information

=> Extraction completeness

=> Metadata quality

### Approved

=> High-confidence events

=> Trusted sources

=> Published automatically

---

### Pending

=> Lower-confidence events

=> Untrusted senders

=> Ambiguous event information

=> Requires administrator review

This creates a hybrid pipeline where automation handles the majority of events while humans review edge cases.

---

# Architecture

### Authentication

=> Google OAuth 2.0

=> Authorization code exchange

=> Refresh token persistence

=> Gmail API access on behalf of the user

---

### Email Processing Pipeline

=> Gmail API email retrieval

=> MIME body extraction

=> Event classification

=> Regex extraction

=> Gemini fallback extraction

=> Confidence scoring

=> Duplicate detection

=> MongoDB persistence

=> Dashboard delivery

---

# User Isolation

Every event document belongs to exactly one user.

```js
{
  userId
}
```

All queries are scoped through the authenticated user's identifier.

This prevents:

=> Cross-user event visibility

=> Shared-state bugs

=> Unauthorized modifications

=> Data leakage between Gmail accounts

---

# Tech Stack

### Frontend

=> React

=> Tailwind CSS

=> JavaScript

---

### Backend

=> Node.js

=> Express.js

=> JWT Authentication

=> Google OAuth 2.0

---

### Database

=> MongoDB

=> Mongoose

---

### External APIs

=> Gmail API

=> Gemini API

---

### Deployment

=> Vercel

=> Render

=> GitHub

---

# Future Work

=> Event recommendation engine

=> Calendar integrations

=> Multi-source ingestion beyond email

=> Advanced analytics dashboard
