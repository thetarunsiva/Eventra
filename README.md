# Eventra

**Turns a noisy college inbox into a personalized event feed without sending every email to an LLM**

SSN students get 100+ emails/week (LMS, attendance, transport, circulars) burying the 2-3 that actually matter. Hackathons, workshops, college seminars. Eventra extracts those automatically from Gmail, with cost and scale treated as primary constraints.

🔗 [Live Link](https://eventra-ssn.vercel.app/) · Requires `@ssn.edu.in` Google account

---

## The Core Engineering Decision

Most email→event tools do this:

```
Email → LLM → Database
```

Every email hits an AI model. That's slow, expensive, and doesn't scale past a few hundred users.

Eventra does this instead:

```
Email → Rule-based classifier → Regex extraction → Gemini (fallback only) → Confidence score → Publish / Review
```

**USP:** ~80% of emails are discarded or resolved by regex before any AI call. Gemini is invoked only when structured parsing fails on ambiguous formats. A cost-aware pipeline where AI is the expensive last resort, not the default path.

| | LLM-first | Eventra |
|---|---|---|
| Gemini calls per 100 emails | ~100 | ~15-20 |
| Cost to scale to 10k users | Linear w/ inbox size | Linear w/ *new* activity only |
| Failure mode | Silent hallucination | Confidence-gated human review |

---

## Key Features

**1. Reprocessing the same inbox every login.**
Naive design re-scans full history each time. Eventra tracks `lastEmailFetchedAt` per user — first login does a full historical sync, every login after only queries emails newer than the last checkpoint. Processing cost scales with *new* activity, not total inbox size.

**2. Trusting AI output blindly.**
Every extracted event gets a confidence score (sender trust, keyword match, extraction completeness). Score ≥90 auto-publishes. Score ≥50 queues for admin review. Below that, it's discarded. Automation handles the majority; humans catch the edge cases — instead of pretending the model is always right.

---

## Architecture

- **Auth:** Google OAuth 2.0, refresh token persistence, Gmail API scoped per user
- **Pipeline:** Classifier → Regex → Gemini Flash fallback → confidence scoring → duplicate detection → MongoDB persistence
- **Sync:** Login-triggered (not polling) — backend wakes on user activity, keeps Render free-tier viable
- **Isolation:** every event scoped to `userId`; no cross-user leakage by construction
- **Model choice:** Gemini Flash, not a heavier reasoning model — the task is structured extraction, not reasoning, so the cheaper/faster model is the *correct* choice, not a compromise

**Stack:** React + Tailwind · Node.js/Express · MongoDB · Gmail API + Gemini API · Vercel + Render

---

*Currently live with 50+ active SSN users.*
