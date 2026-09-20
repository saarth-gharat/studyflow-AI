-- Apply manually in Supabase SQL Editor after 001_learning_persistence.sql.
-- Adds only activity types required by Study Planner, Doubt Solver, and Flashcards.

alter table public.activity_history
drop constraint if exists activity_history_activity_type_check;

alter table public.activity_history
add constraint activity_history_activity_type_check
check (activity_type in (
  'video_view',
  'note_generated',
  'quiz_started',
  'quiz_completed',
  'tutor_session',
  'learning_path_generated',
  'learning_path_topic_opened',
  'planner_created',
  'planner_day_completed',
  'doubt_asked',
  'flashcards_generated',
  'flashcards_completed'
));
