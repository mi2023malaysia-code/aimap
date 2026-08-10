create policy "115b_drafts_no_direct_client_access"
on public."115b_assessment_drafts"
for all
to anon, authenticated
using (false)
with check (false);

create policy "115b_submissions_no_direct_client_access"
on public."115b_assessment_submissions"
for all
to anon, authenticated
using (false)
with check (false);
