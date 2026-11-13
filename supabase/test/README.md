# Testing the schema without Supabase

`supabase-stubs.sql` fakes the bits of Supabase the schema needs (`anon`/`authenticated` roles,
`auth.uid()`, `storage.*`). Run against any local PostgreSQL 15+:

```bash
createdb spg_test
psql -d spg_test -f supabase/test/supabase-stubs.sql
psql -d spg_test -v ON_ERROR_STOP=1 -f supabase/schema.sql
psql -d spg_test -f supabase/test/rls-test.sql   # lines marked "(expect error)" must print an ERROR
```
