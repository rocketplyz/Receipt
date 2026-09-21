# TODO / open questions

## Environment constraints
- No Docker daemon in the Claude Code sandbox used to build this, so `supabase start`
  (local Postgres) doesn't work here. Migrations in `supabase/migrations/` need to be
  applied to the linked hosted project with `supabase db push` (or pasted into the
  dashboard's SQL editor) rather than tested locally first.
- No simulator/device available in this sandbox either. Verified so far: typecheck,
  lint, unit tests, and a full Metro bundle (`expo export --platform ios`) all pass.
  Not yet verified: actually running on a device/simulator, magic-link deep-link
  round-trip, and the Supabase auto-create-household trigger against the real project.

## Deferred from Phase 1 scope
- Currency is hardcoded to USD in the purchase form; the schema supports other
  currencies but there's no picker yet.
- `merchant_policies` / `category_defaults` are seeded via migration only — no
  admin UI to edit them (matches the brief: "seed with common retailers; user can
  override" happens per-purchase via the manual override, not by editing the table).
- No pagination on the purchases list yet; fine at the scale Phase 1 targets (a
  household's manually-entered items), worth revisiting once Phase 2/4 (photo/email
  import) can add purchases in bulk.

## Needs a human decision before proceeding
- Confirm the Supabase migrations have actually been applied to the linked project
  (dxaqrclotqzkscjtjzvf) before testing sign-in — Phase 0's auto-create-household
  trigger depends on `0001_households.sql` being applied.
- Repo push access: this session currently can't push to `rocketplyz/Receipt` (403).
  Commits are sitting locally on `claude/warranty-receipt-vault-plan-i2ubnc` until
  GitHub access is granted.
