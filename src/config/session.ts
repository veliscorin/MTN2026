// Edit this string to change the session start time (Format: YYYY-MM-DD HH:mm:ss)
// Example: "2026-01-09 17:15:00"
const START_TIME_STR = "2026-01-09 17:21:00"; 

export const SESSION_START_TIME = new Date(START_TIME_STR.replace(' ', 'T')).getTime();
export const SESSION_DURATION = 10 * 60 * 1000; // 10 minutes
export const SESSION_END_TIME = SESSION_START_TIME + SESSION_DURATION;