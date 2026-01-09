# 📝 Product Requirements Document: Synchronized Quiz Engine (v13)

**Project Name:** What’s The News 2026 – Academic Quiz Engine  
**Version:** 13.0  
**Target Concurrency:** 10,000 – 12,000 (32,000 Total Users)

---

## 1. PROJECT OVERVIEW
The Synchronized Quiz Engine is a high-concurrency, serverless MCQ platform built for school-wide academic competitions. The system ensures a "Fair Start/Fair Finish" experience using synchronized server clocks and hard-stop mechanisms, supported by a serverless architecture to handle massive traffic bursts.

## 2. TARGET USERS & ENVIRONMENT
* **Primary Users:** Singapore Secondary 4/5 students.
* **Hardware:** Personal Learning Devices (PLDs) – iPads, Chromebooks, Laptops.
* **Access Point:** `whatsthenews2026.com`
* **Connectivity:** School Wi-Fi (requires MOE/School domain whitelisting).

---

## 3. FUNCTIONAL REQUIREMENTS

### 3.1 Pre-Login & Anti-Sabotage Authentication
* **Early Access:** The login portal opens 20 minutes before the official `StartTime`.
* **Login Credentials:** Email Prefix + School Selection (Dropdown).
* **Overwrite Protection (Sabotage Lock):**
    * The system **must** use **DynamoDB Conditional Writes** (`attribute_not_exists`).
    * Once a student "claims" an email prefix for a specific school, the record is locked.
    * Subsequent attempts to "Start" or "Login" with that identical prefix must be rejected with a "Session already active" error to prevent intentional or accidental sabotage.
* **Join Cut-off:** Entry is strictly blocked if a student attempts to join within the final 5 minutes of the session window.

### 3.2 The Synchronized Lobby (Wait State)
* **Lobby View:** Upon successful login before the start time, users are placed in a "Lobby" state.
* **Drift-Corrected Timer:** The frontend must fetch the server timestamp and calculate "Clock Drift." A countdown timer must display: *"The quiz will begin in MM:SS"*, syncing precisely with the AWS server time.
* **Auto-Trigger:** At `T-minus 0`, the UI must automatically transition to Question 1 via a state change. **No browser refresh should be required.**

### 3.3 Sequential Quiz Experience
* **Navigation:** Linear "Confirm & Next" progression. **The "Back" button is strictly disabled.**
* **Live Session Timer:** A persistent countdown timer in the header displays "Time Remaining," counting down to the `SessionEndTime`.
* **Secure Question Fetching:** Questions are fetched one-by-one. The `correct_answer` key must be stripped by the Lambda before sending the payload to the browser.
* **State Recovery:** Every "Next" click commits the answer and current index to DynamoDB. Upon refresh, the app restores the student to the last unanswered index.

### 3.4 Proctoring & Anti-Cheating (3-Strike Rule)
* **Monitored Events:** `visibilitychange` (tab switch), `window.blur` (app switch), and `fullscreenchange` (exiting fullscreen).
* **Escalation:**
    * **Strike 1:** Warning Overlay.
    * **Strike 2:** Final Warning Overlay.
    * **Strike 3:** **Hard Disqualification**. The system commits `isDisqualified: true` to the database and force-redirects the user to a disqualification screen.

### 3.5 Global Hard-Stop
* At the exact `SessionEndTime`, the Lambda backend must return a `410 Gone` for any answer submissions.
* The frontend must immediately terminate the quiz and redirect to a "Submission Complete" page.

---

## 4. RANKING & REPORTING LOGIC

### 4.1 Leaderboard Generation (Top 20 Per School)
* **Ranking Hierarchy:**
    1. **Primary:** Highest Total Points (Max 30).
    2. **Secondary (Tie-breaker):** Total Time Taken ($FinalSubmitTimestamp - InitialStartTimestamp$) in **milliseconds**.
* **Data Integrity:** All users with a `isDisqualified` flag must be automatically excluded from all ranking calculations.

### 4.2 Automated Results
* **Email Delivery:** Results are triggered via Amazon SES immediately upon quiz completion.
* **Content:** Final Score (X/30) and a review table showing the correct answer keys.

---

## 5. TECHNICAL DATA SCHEMA

### Table: UserState (DynamoDB)
| Field | Type | Description |
| :--- | :--- | :--- |
| **email** | String (PK) | Full validated school email (Sabotage-protected). |
| **school_id** | String | ID of the school from the dropdown. |
| **status** | String | `LOBBY`, `IN_PROGRESS`, `COMPLETED`, `DISQUALIFIED`. |
| **current_index** | Number | The question index currently being viewed (0-29). |
| **score** | Number | Running total of correctly answered questions. |
| **strike_count** | Number | Number of anti-cheating violations (max 3). |
| **start_time** | Timestamp | Epoch MS recorded when the student first exits the Lobby. |
| **is_disqualified** | Boolean | Flag to exclude student from ranking and stop quiz. |

### Table: Questions (DynamoDB)
| Field | Type | Description |
| :--- | :--- | :--- |
| **qid** | String (PK) | Unique question identifier. |
| **difficulty** | String | easy / medium / hard. |
| **text** | String | The question/prompt text. |
| **options** | Array | List of 4 MCQ choices. |
| **correct_key** | String | **REDACTED:** Used for server-side scoring only. |

---

## 6. SECURITY & PERFORMANCE SPECIFICATION
* **Scaling:** Provisioned Concurrency (8,000–10,000 units) to be active 15 mins before and after each window.
* **Networking:** Non-VPC Lambda execution to eliminate ENI cold-start delays.
* **Persistence:** Write-on-action strategy for all student responses to prevent data loss on school Wi-Fi drops.