import { Lesson } from '@/types/schema_extensions';

/**
 * Converts any lesson object to a format compatible with Supabase schema
 * This is useful when passing lesson data to components that expect a specific schema
 */
export function convertToSupabaseLesson(lesson: any | null): Lesson | null {
  if (!lesson) return null;

  // Return lesson if it's already in the correct format
  if ('ai_summary' in lesson && 'transcript' in lesson) {
    return lesson as Lesson;
  }

  // Convert the format if needed
  return {
    id: lesson.id || '',
    student_id: lesson.student_id || lesson.studentId || (lesson.student && lesson.student.id) || '',
    teacher_id: lesson.teacher_id || lesson.teacherId || '',
    date: lesson.date || new Date().toISOString().split('T')[0],
    start_time: lesson.start_time || lesson.startTime || '09:00:00',
    end_time: lesson.end_time || lesson.endTime || '10:00:00',
    status: lesson.status || 'completed',
    location: lesson.location || 'Studio',
    summary: lesson.summary || '',
    notes: lesson.notes || '',
    transcript_url: lesson.transcript_url || lesson.transcriptUrl || null,
    transcript: lesson.transcript || null,
    ai_summary: lesson.ai_summary || lesson.aiSummary || null,
    created_at: lesson.created_at || lesson.createdAt || new Date().toISOString(),
    updated_at: lesson.updated_at || lesson.updatedAt || new Date().toISOString()
  };
} 