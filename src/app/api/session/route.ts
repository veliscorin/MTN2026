import { NextResponse } from 'next/server';
import { SESSION_START_TIME, SESSION_END_TIME } from '@/config/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    startTime: SESSION_START_TIME,
    endTime: SESSION_END_TIME,
  });
}
