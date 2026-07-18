alter table public.assessment_sessions
  alter column page_size set default 4,
  alter column total_questions set default 20,
  alter column page_count set default 5;
