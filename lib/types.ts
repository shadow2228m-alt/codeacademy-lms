// CodeAcademy LMS - Ultra-Granular TypeScript Contracts
// Next.js 16 / Supabase

export type QuestionType = 'multiple_choice' | 'essay_code';
export type AttemptStatus = 'in_progress' | 'submitted' | 'graded';

export interface Quiz {
  id: string;
  title: string;
  duration_minutes: number;
  total_score: number;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  quiz_id: string;
  q_type: QuestionType;
  question_text: string;
  options: { A: string; B: string; C: string; D: string } | null;
  correct_option: 'A'|'B'|'C'|'D'|null;
  max_points: number;
  order_index: number;
  evaluation_meta?: {
    max_chars?: number;
    require_for_loop?: boolean;
    require_function_name?: string | null;
  } | null;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  student_id: string;
  status: AttemptStatus;
  score_achieved: number;
  started_at: string;
  submitted_at: string | null;
  ai_feedback: string | null;
}

export interface StudentAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_option: string | null;
  written_code: string | null;
  is_correct: boolean | null;
  score_awarded: number;
}

export interface StudentProfile {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  interests: string[];
  total_xp: number;
  exams_passed: number;
  accumulated_quiz_scores: number;
  active_daily_streak: number;
  last_submission_date: string | null;
}

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string | null;
  emoji: string;
  color: string;
  created_at: string;
}

export interface StudentBadge {
  id: string;
  student_id: string;
  badge_id: string;
  granted_at: string;
  granted_by: string | null;
  badge_definitions?: BadgeDefinition;
}

export interface QuizBuilderQuestionInput {
  q_type: QuestionType;
  question_text: string;
  order_index: number;
  max_points: number;
  options?: { A: string; B: string; C: string; D: string };
  correct_option?: 'A'|'B'|'C'|'D';
  evaluation_meta?: {
    max_chars?: number;
    require_for_loop?: boolean;
    require_function_name?: string | null;
  };
}

export interface CreateQuizInput {
  title: string;
  duration_minutes: number;
  total_score: number;
  questions: QuizBuilderQuestionInput[];
}

export interface GeminiGradeResult {
  score_awarded: number;
  is_correct: boolean;
  arabic_critique: string;
}

// XP Formula types
// XP = (E_passed * 100) + Σ(S_achieved) + (C_streak * 50)
export interface XPCalculation {
  E_passed: number;
  S_achieved: number;
  C_streak: number;
  total_xp: number;
}
