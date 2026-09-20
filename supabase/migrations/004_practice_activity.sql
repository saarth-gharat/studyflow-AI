-- Apply manually after 003_revision_activity.sql.
-- Adds Practice Lab activity events to the existing activity history table.

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
  'flashcards_completed',
  'revision_started',
  'revision_completed',
  'practice_started',
  'practice_question_answered',
  'practice_completed',
  'practice_abandoned',
  'practice_score_recorded',
  'coding_challenge_completed'
));
