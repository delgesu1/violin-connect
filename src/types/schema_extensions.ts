// Type definitions for new schema extensions

export type RepertoireFile = {
  id: string;
  master_piece_id: string;
  user_id: string;
  file_name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  description: string | null;
  uploaded_at: string;
  created_at: string;
  updated_at: string;
}

export type RepertoireLink = {
  id: string;
  master_piece_id: string;
  user_id: string;
  title: string;
  url: string;
  link_type: 'youtube' | 'article' | 'score' | 'recording' | 'other' | null;
  description: string | null;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

export type CalendarEvent = {
  id: string;
  teacher_id: string;
  title: string;
  start_time: string;
  end_time: string;
  event_type: string;
  location: string | null;
  description: string | null;
  student_id: string | null;
  lesson_id: string | null;
  all_day: boolean | null;
  recurrence_rule: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export type LessonEvent = {
  lesson_id: string;
  calendar_event_id: string | null;
  student_id: string;
  student_name: string;
  student_avatar: string | null;
  event_date: string | null;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  summary: string | null;
  notes: string | null;
  user_id: string | null;
}

// Type for lessons with additional fields
export type EnhancedLesson = {
  id: string;
  student_id: string;
  date: string;
  summary: string | null;
  transcript_url: string | null;
  notes: string | null;
  ai_summary: string | null;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
}

// Student model
export interface Student {
  id: string;
  user_id: string;
  name: string;
  avatar_url: string | null;
  level: string | null;
  email: string | null;
  phone: string | null;
  academic_year: string | null;
  start_date: string | null;
  last_lesson_date: string | null;
  next_lesson: string | null;
  unread_messages: number | null;
  difficulty_level: string | null;
  next_lesson_id: string | null;
  created_at: string;
  updated_at: string;
  // Used for tracking cache source
  _source?: 'database' | 'cached' | 'mock' | 'cached-fallback' | 'mock-fallback';
}

// Lesson model
export type Lesson = {
  id: string;
  student_id: string;
  teacher_id: string | null;
  date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  summary: string | null;
  notes: string | null;
  status: string | null;
  transcript_url: string | null;
  transcript: string | null;
  ai_summary: string | null;
  created_at: string;
  updated_at: string;
}

// StudentRepertoire model
export type StudentRepertoire = {
  id: string;
  student_id: string;
  master_piece_id: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  performance_date: string | null;
  performance_location: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// MasterRepertoire model - match what's in the database
export type MasterRepertoire = {
  id: string;
  title: string;
  composer: string;
  arranger: string | null;
  difficulty: string | null;
  style: string | null;
  level: string | null;
  genre: string | null;
  period: string | null;
  instrument: string | null;
  year: string | null;
  started_date: string | null;
  user_id: string | null;
  description: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
} 