create index "115b_assessment_submissions_source_draft_idx"
  on public."115b_assessment_submissions" (source_draft_id)
  where source_draft_id is not null;

revoke execute on function public.save_115b_assessment_draft(uuid, integer, jsonb, text)
  from authenticated;
revoke execute on function public.load_115b_assessment_draft(uuid)
  from authenticated;
revoke execute on function public.discard_115b_assessment_draft(uuid)
  from authenticated;
revoke execute on function public.submit_115b_assessment(uuid, uuid, jsonb)
  from authenticated;
