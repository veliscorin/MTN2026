# Product Requirements Document: Synchronized Quiz Engine (v9)

## 1. Project Overview
A secure, high-concurrency, serverless MCQ platform for school-wide preliminary exams. 
- **Scale:** 32,000 concurrent students across 3 time windows.
- **Goal:** Synchronized finish and millisecond-accurate ranking.
- **Access:** [whatsthenews2026.com](https://whatsthenews2026.com)

## 2. Environment & Access
- **Users:** Singapore Secondary 4/5 students.
- **Hardware:** iPads, Chromebooks, and Laptops (PLDs).
- **Network:** School Wi-Fi (requires domain whitelisting).

## 3. Functional Requirements

### 3.1 Authentication
- **No Registration:** Based on official school email prefix.
- **School Selection:** Dropdown appends domain (e.g., `@sch.edu.sg`).
- **Join Window:** Blocked if within 5 minutes of session end.

### 3.2 Synchronized Auto-Start
- **Lobby:** Countdown screen for early arrivals.
- **Clock Sync:** Frontend must calculate **Clock Drift** against AWS server time.
- **Transition:** Auto-redirect to Q1 at $T-0$ without refresh.

### 3.3 Quiz Experience
- **Total Questions:** 30 (10 Easy, 10 Medium, 10 Hard).
- **Randomization:** Shuffled questions within buckets; shuffled MCQ options.
- **Linearity:** "Confirm & Next" only. Back button is disabled.
- **State Recovery:** Save response/index on every "Next" click to DynamoDB.

### 3.4 Anti-Cheating (The 3-Strike Rule)
- **Monitors:** Browser focus, Fullscreen status, Tab switching.
- **Strikes:** 1. Warning
  2. Final Warning
  3. Automatic Disqualification
- **Input Blocking:** Disable Right-click, Copy/Paste, and Dev-tool shortcuts.

### 3.5 Hard-Stop Logic
- **Backend:** Stop accepting answers at exactly `SessionEndTime`.
- **Frontend:** Forced redirect to "Processing" page at expiration.

## 4. Ranking & Reporting
### 4.1 Leaderboard
- **Scope:** Top 20 per school (16 schools total).
- **Primary Rank:** Total Score (1 point/correct).
- **Tie-breaker:** Total time in milliseconds (`FinalSubmit` - `InitialStart`).
- **Exclusion:** Filter out disqualified students.

### 4.2 Results
- **Email:** Automated via Amazon SES.
- **Content:** Final score and correct answer key table.

## 5. Technical Data Schema (DynamoDB)

### Table: `UserState`
| Field | Type | Description |
| :--- | :--- | :--- |
| `email` (PK) | String | Validated school email |
| `school_id` | String | Selected school ID |
| `current_index`| Number | Current question (0-29) |
| `score` | Number | Running total |
| `strike_count` | Number | Anti-cheating violations