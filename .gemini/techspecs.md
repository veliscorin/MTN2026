# 🛠️ Technical Specification: Next.js Prototype

## 1. Stack & Environment
* **Framework:** Next.js 16 (App Router).
* **Styling:** Tailwind CSS (Mobile-first, Exam Aesthetic).
* **Deployment:** Vercel.
* **State Management:** React Context or Redux for quiz state tracking.

## 2. Data Strategy (Prototype Phase)
* **Local Mocks:** All data fetched from `@/src/data/`.
    - `questions.json`: Stores question text and options.
    - `schools.json`: Map of school names to email domains.
* **Type Safety:** All quiz objects must implement interfaces defined in `@/src/types/quiz.ts`.

## 3. Component Architecture
* **`QuizContainer`**: Handles state, strike logic, and question indexing.
* **`QuestionCard`**: Stateless component for rendering MCQ options.
* **`StrikeModal`**: High-priority overlay for cheating warnings.

## 4. Strike System Implementation
* Use a global `useEffect` at the layout level to attach listeners for `visibilitychange`.
* Maintain a `strikeCount` in state.
* If `strikeCount === 3`, immediately set `isDisqualified` to true and clear local session storage.