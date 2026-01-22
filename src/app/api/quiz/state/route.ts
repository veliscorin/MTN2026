import { NextRequest, NextResponse } from 'next/server';
import { getUserState, saveUserState } from '@/lib/db-actions';
import questionsData from '@/data/questions.json';
import { sendResultsEmail } from '@/lib/email-service';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  try {
    const state = await getUserState(email);
    if (!state) {
      return NextResponse.json({ message: 'No state found' }, { status: 404 });
    }
    return NextResponse.json(state);
  } catch (error) {
    console.error('Error fetching user state:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, schoolId, state } = body;

    if (!email || !schoolId || !state) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Server-side scoring logic
    if (state.answers) {
      let currentScore = 0;
      Object.entries(state.answers).forEach(([qid, answer]) => {
        const question = questionsData.find((q) => q.qid === qid);
        if (question && question.correct_key === answer) {
          currentScore += 1;
        }
      });
      state.score = currentScore;
    }

    // Save to DynamoDB
    await saveUserState(email, schoolId, state);

    // If Completed, Send Email
    if (state.status === 'COMPLETED' && state.answers) {
      // We don't block the response for email, but we should log errors.
      // In serverless, it's safer to await to ensure execution before freeze.
      await sendResultsEmail(email, state.answers, state.time_taken || 'N/A');
    }

    return NextResponse.json({ success: true, score: state.score });
  } catch (error) {
    console.error('Error saving user state:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
