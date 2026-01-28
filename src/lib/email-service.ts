import questionsData from '@/data/questions.json';

const API_KEY = process.env.WTN_MAILGUN_API_KEY;
const DOMAIN = process.env.WTN_MAILGUN_DOMAIN;
const FROM_EMAIL = process.env.WTN_MAILGUN_FROM || 'WTN 2026 Secretariat <secretariat@whatsthenews2026.com>';

interface EmailReviewItem {
  qid: string;
  text: string;
  yourAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

function generateHtml(email: string, score: number, total: number, timeTaken: string, review: EmailReviewItem[]) {
  const rows = review.map(item => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 10px; color: ${item.isCorrect ? 'green' : 'red'}; font-weight: bold;">
        ${item.isCorrect ? '✓' : '✗'}
      </td>
      <td style="padding: 10px;">${item.text}</td>
      <td style="padding: 10px;">${item.yourAnswer}</td>
      <td style="padding: 10px; color: #555;">${item.correctAnswer}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>WTN 2026 Quiz Results</h2>
      <p><strong>Student:</strong> ${email}</p>
      <div style="background: #f4f4f4; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
        <h1 style="margin: 0; color: #333;">${score} / ${total}</h1>
        <p style="margin: 5px 0 0 0; color: #666;">Time Taken: ${timeTaken}</p>
      </div>
      
      <h3>Detailed Review</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <thead>
          <tr style="background: #eee; text-align: left;">
            <th style="padding: 10px;"></th>
            <th style="padding: 10px;">Question</th>
            <th style="padding: 10px;">Your Answer</th>
            <th style="padding: 10px;">Correct</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

export async function sendResultsEmail(email: string, answers: Record<string, string>, timeTaken: string) {
  if (!API_KEY || !DOMAIN) {
    console.warn("⚠️ Mailgun credentials missing. Skipping email.");
    return;
  }

  // 1. Generate Review Data
  let score = 0;
  const reviewData: EmailReviewItem[] = [];
  const total = Object.keys(answers).length;

  Object.entries(answers).forEach(([qid, userAns]) => {
    const q = questionsData.find(q => q.qid === qid);
    if (!q) return;

    const isCorrect = q.correct_key === userAns;
    if (isCorrect) score++;

    reviewData.push({
      qid,
      text: q.text,
      yourAnswer: userAns,
      correctAnswer: q.correct_key,
      isCorrect
    });
  });

  // 2. Build HTML
  const html = generateHtml(email, score, total, timeTaken, reviewData);

  // 3. Send via Mailgun API
  const formData = new FormData();
  formData.append('from', FROM_EMAIL);
  formData.append('to', email);
  formData.append('subject', `WTN 2026 Results: ${score}/${total}`);
  formData.append('html', html);

  try {
    const auth = Buffer.from(`api:${API_KEY}`).toString('base64');
    const res = await fetch(`https://api.mailgun.net/v3/${DOMAIN}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`
      },
      body: formData
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Mailgun Error:", err);
    } else {
      console.log(`✅ Results email sent to ${email}`);
    }
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}
