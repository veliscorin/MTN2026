export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  qid: string;
  difficulty: Difficulty;
  text: string;
  options: string[]; // Shuffled MCQ choices
}

export interface UserState {
  email: string;
  school_id: string;
  current_index: number;
  score: number;
  strike_count: number;
  start_time: number; // Epoch MS
  is_disqualified: boolean;
}

export interface School {
  id: string;
  name: string;
  domain: string;
}